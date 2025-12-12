"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Film, Loader2 } from "lucide-react";

interface MovieRequest {
  id: string;
  user_id: string | null;
  movie_title: string;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  user_email?: string; // We'll fetch this separately or join if possible
}

export default function AdminRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<MovieRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("movie_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user emails for these requests (if user_id exists)
      // Note: In a real app with many users, a join or better strategy is needed.
      // Here we'll just do a simple lookup for simplicity or skip if complex.
      // For now, let's just display the requests.

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("movie_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setRequests(requests.map(req =>
        req.id === id ? { ...req, status: newStatus as any } : req
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã duyệt</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1"><Film className="w-3 h-3" /> Đã có phim</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Yêu Cầu Phim</h1>
          <p className="text-slate-500 mt-1">Quản lý các yêu cầu phim từ người dùng</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchRequests} variant="outline" size="icon">
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px]">Tên Phim</TableHead>
              <TableHead className="w-[300px]">Ghi Chú</TableHead>
              <TableHead className="w-[150px]">Ngày Gửi</TableHead>
              <TableHead className="w-[150px]">Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  Chưa có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="text-base text-slate-900">{request.movie_title}</div>
                    {request.user_id && (
                      <div className="text-xs text-slate-400 mt-1">User ID: {request.user_id.slice(0, 8)}...</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600 line-clamp-2" title={request.note || ""}>
                      {request.note || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(request.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      defaultValue={request.status}
                      onValueChange={(value: string) => updateStatus(request.id, value)}
                    >
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="approved">Duyệt</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
