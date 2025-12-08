"use client";

import { useEffect, useState } from "react";
import { getReports, getReportStats, updateReportStatus, type Report } from "@/service/report";
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  in_progress: { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Loader2 },
  resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  dismissed: { label: "Đã bỏ qua", color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
};

const issueTypeLabels: Record<string, string> = {
  video_not_playing: "Video không phát được",
  subtitle_error: "Lỗi phụ đề",
  wrong_video: "Video bị sai",
  audio_sync: "Âm thanh không đồng bộ",
  video_quality: "Chất lượng video kém",
  buffering: "Video bị giật/lag",
  subtitle_sync: "Phụ đề không đồng bộ",
  subtitle_missing: "Thiếu phụ đề",
  other: "Lỗi khác",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, dismissed: 0 });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        getReports({
          status: selectedStatus === "all" ? undefined : selectedStatus as any,
          limit: 100,
        }),
        getReportStats(),
      ]);

      setReports(reportsData.reports);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: Report['status']) => {
    try {
      await updateReportStatus(reportId, newStatus);
      await loadData();
      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Quản Lý Báo Cáo</h1>
        <p className="text-slate-600">Xem và xử lý các báo cáo lỗi từ người dùng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => setSelectedStatus("all")}
          className={`p-4 rounded-xl border-2 transition-all ${selectedStatus === "all"
              ? "bg-slate-900 border-slate-900 text-white"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="text-2xl font-black mb-1">{stats.total}</div>
          <div className="text-sm font-medium opacity-80">Tổng số</div>
        </button>

        <button
          onClick={() => setSelectedStatus("pending")}
          className={`p-4 rounded-xl border-2 transition-all ${selectedStatus === "pending"
              ? "bg-yellow-400 border-yellow-400 text-slate-900"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="text-2xl font-black mb-1">{stats.pending}</div>
          <div className="text-sm font-medium opacity-80">Chờ xử lý</div>
        </button>

        <button
          onClick={() => setSelectedStatus("in_progress")}
          className={`p-4 rounded-xl border-2 transition-all ${selectedStatus === "in_progress"
              ? "bg-blue-400 border-blue-400 text-white"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="text-2xl font-black mb-1">{stats.inProgress}</div>
          <div className="text-sm font-medium opacity-80">Đang xử lý</div>
        </button>

        <button
          onClick={() => setSelectedStatus("resolved")}
          className={`p-4 rounded-xl border-2 transition-all ${selectedStatus === "resolved"
              ? "bg-green-400 border-green-400 text-white"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="text-2xl font-black mb-1">{stats.resolved}</div>
          <div className="text-sm font-medium opacity-80">Đã giải quyết</div>
        </button>

        <button
          onClick={() => setSelectedStatus("dismissed")}
          className={`p-4 rounded-xl border-2 transition-all ${selectedStatus === "dismissed"
              ? "bg-gray-400 border-gray-400 text-white"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="text-2xl font-black mb-1">{stats.dismissed}</div>
          <div className="text-sm font-medium opacity-80">Đã bỏ qua</div>
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">Đang tải...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Loại lỗi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((report) => {
                  const StatusIcon = statusConfig[report.status].icon;
                  return (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{report.movie_title}</div>
                        {report.description && (
                          <div className="text-sm text-slate-500 mt-1 line-clamp-1">
                            {report.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {issueTypeLabels[report.issue_type] || report.issue_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[report.status].color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[report.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Chi Tiết Báo Cáo</h2>
              <p className="text-sm text-slate-600">ID: {selectedReport.id}</p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Phim
                </label>
                <p className="text-lg font-bold text-slate-900">{selectedReport.movie_title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Loại lỗi
                </label>
                <p className="text-slate-900 font-medium">
                  {issueTypeLabels[selectedReport.issue_type] || selectedReport.issue_type}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Mô tả
                  </label>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Trạng thái
                  </label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${statusConfig[selectedReport.status].color}`}>
                    {statusConfig[selectedReport.status].label}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Thời gian
                  </label>
                  <p className="text-slate-700 text-sm">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Cập nhật trạng thái
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(statusConfig) as Array<Report['status']>).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedReport.id, status)}
                      className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedReport.status === status
                          ? statusConfig[status].color.replace('100', '200')
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200">
              <Button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
