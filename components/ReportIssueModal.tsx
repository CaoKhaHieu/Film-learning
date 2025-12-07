import { useState } from "react";
import { X, AlertTriangle, Send, PlayCircle, FileText, Film, Volume2, MonitorX, Wifi, Clock, FileQuestion, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReport } from "@/service/report";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  movieTitle: string;
}

const issueTypes = [
  { value: "video_not_playing", label: "Video không phát được", icon: PlayCircle },
  { value: "subtitle_error", label: "Lỗi phụ đề", icon: FileText },
  { value: "wrong_video", label: "Video bị sai", icon: Film },
  { value: "audio_sync", label: "Âm thanh không đồng bộ", icon: Volume2 },
  { value: "video_quality", label: "Chất lượng video kém", icon: MonitorX },
  { value: "buffering", label: "Video bị giật/lag", icon: Wifi },
  { value: "subtitle_sync", label: "Phụ đề không đồng bộ", icon: Clock },
  { value: "subtitle_missing", label: "Thiếu phụ đề", icon: FileQuestion },
  { value: "other", label: "Lỗi khác", icon: AlertCircle },
];

export function ReportIssueModal({ isOpen, onClose, movieId, movieTitle }: ReportIssueModalProps) {
  const [selectedIssue, setSelectedIssue] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIssue) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await createReport({
        movieId,
        movieTitle,
        issueType: selectedIssue,
        description: description.trim() || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit report');
      }

      console.log("Report submitted successfully:", result.reportId);
      setIsSubmitted(true);

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedIssue("");
    setDescription("");
    setIsSubmitted(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Báo Lỗi Video</h2>
              <p className="text-sm text-slate-600 mt-0.5">{movieTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full flex-shrink-0"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Đã Gửi Báo Cáo!</h3>
              <p className="text-slate-600">
                Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xử lý sớm nhất.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type Grid */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">
                  Chọn loại lỗi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {issueTypes.map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <button
                        key={issue.value}
                        type="button"
                        onClick={() => setSelectedIssue(issue.value)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${selectedIssue === issue.value
                            ? "bg-yellow-50 border-yellow-400 shadow-md"
                            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex flex-col gap-2">
                          <Icon className={`w-6 h-6 ${selectedIssue === issue.value ? "text-yellow-600" : "text-slate-400"
                            }`} />
                          <span className={`text-sm font-medium leading-tight ${selectedIssue === issue.value ? "text-slate-900" : "text-slate-700"
                            }`}>
                            {issue.label}
                          </span>
                        </div>
                        {selectedIssue === issue.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-slate-900 mb-2">
                  Mô tả chi tiết (không bắt buộc)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none text-sm"
                  placeholder="Mô tả thêm về lỗi bạn gặp phải..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium h-12"
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold shadow-lg hover:shadow-xl transition-all h-12"
                  disabled={!selectedIssue || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi Báo Cáo
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
