"use server";

import { createClient } from '@/lib/supabase-server';

// Types
export interface Report {
  id: string;
  movie_id: string;
  movie_title: string;
  issue_type: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  admin_notes: string | null;
}

export interface CreateReportInput {
  movieId: string;
  movieTitle: string;
  issueType: string;
  description?: string;
}

export interface GetReportsParams {
  movieId?: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  limit?: number;
  offset?: number;
}

// Valid issue types
const VALID_ISSUE_TYPES = [
  'video_not_playing',
  'subtitle_error',
  'wrong_video',
  'audio_sync',
  'video_quality',
  'buffering',
  'subtitle_sync',
  'subtitle_missing',
  'other'
] as const;

/**
 * Create a new report
 */
export async function createReport(input: CreateReportInput): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const { movieId, movieTitle, issueType, description } = input;

    // Validate required fields
    if (!movieId || !movieTitle || !issueType) {
      return { success: false, error: 'Missing required fields' };
    }

    // Validate issue type
    if (!VALID_ISSUE_TYPES.includes(issueType as any)) {
      return { success: false, error: 'Invalid issue type' };
    }

    const supabase = await createClient();

    // Insert report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        movie_id: movieId,
        movie_title: movieTitle,
        issue_type: issueType,
        description: description || null,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return { success: false, error: 'Failed to create report' };
    }

    return { success: true, reportId: data.id };
  } catch (error) {
    console.error('Error in createReport:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get reports with optional filters
 */
export async function getReports(params: GetReportsParams = {}): Promise<{ reports: Report[]; total: number }> {
  try {
    const { movieId, status, limit = 50, offset = 0 } = params;

    const supabase = await createClient();

    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (movieId) {
      query = query.eq('movie_id', movieId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return { reports: [], total: 0 };
    }

    return {
      reports: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getReports:', error);
    return { reports: [], total: 0 };
  }
}

/**
 * Get a single report by ID
 */
export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getReportById:', error);
    return null;
  }
}

/**
 * Update report status (for admin)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const updateData: any = {
      status,
      admin_notes: adminNotes || null
    };

    // Set resolved_at if status is resolved
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId);

    if (error) {
      console.error('Error updating report:', error);
      return { success: false, error: 'Failed to update report' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get report statistics
 */
export async function getReportStats(): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  dismissed: number;
}> {
  try {
    const supabase = await createClient();

    const [totalResult, pendingResult, inProgressResult, resolvedResult, dismissedResult] = await Promise.all([
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'dismissed'),
    ]);

    return {
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      inProgress: inProgressResult.count || 0,
      resolved: resolvedResult.count || 0,
      dismissed: dismissedResult.count || 0,
    };
  } catch (error) {
    console.error('Error in getReportStats:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      dismissed: 0,
    };
  }
}
