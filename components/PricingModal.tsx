"use client";

import { useState, useEffect } from "react";
import { X, Check, Crown, Zap, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTransaction, checkTransactionStatus } from "@/service/payment";
import { toast } from "sonner";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function PricingModal({ isOpen, onClose, user }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime">("yearly");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCode, setPaymentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);



  const plans = {
    monthly: {
      id: "monthly",
      name: "1 Tháng",
      price: "49.000đ",
      originalPrice: "79.000đ",
      period: "/tháng",
      description: "Thích hợp để trải nghiệm thử",
      features: [
        "Xem phim không giới hạn",
        "Phụ đề song ngữ Anh - Việt",
        "Tra từ điển thông minh",
        "Lưu từ vựng không giới hạn",
      ],
    },
    yearly: {
      id: "yearly",
      name: "1 Năm",
      price: "399.000đ",
      originalPrice: "588.000đ",
      period: "/năm",
      description: "Tiết kiệm 32% - Phổ biến nhất",
      features: [
        "Tất cả quyền lợi gói tháng",
        "Tiết kiệm 189.000đ",
        "Hỗ trợ ưu tiên 24/7",
        "Yêu cầu phim ưu tiên",
      ],
      isPopular: true,
    },
    lifetime: {
      id: "lifetime",
      name: "Trọn Đời",
      price: "899.000đ",
      originalPrice: "1.999.000đ",
      period: "một lần",
      description: "Đầu tư một lần, học mãi mãi",
      features: [
        "Tất cả quyền lợi gói năm",
        "Không bao giờ phải gia hạn",
        "Quyền truy cập tính năng mới sớm nhất",
        "Yêu cầu phim ưu tiên và không giới hạn",
      ],
    },
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Create Transaction via Server Action
      const result = await createTransaction(
        plans[selectedPlan].id,
        parseInt(plans[selectedPlan].price.replace(/\D/g, ""))
      );

      if (result.paymentCode) {
        setPaymentCode(result.paymentCode);
        setShowPayment(true);
        setIsChecking(true);
      } else {
        toast.error(result.error || "Lỗi tạo giao dịch. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isChecking && paymentCode) {
      interval = setInterval(async () => {
        try {
          const result = await checkTransactionStatus(paymentCode);

          if (result.status === "completed") {
            setIsChecking(false);
            clearInterval(interval);
            toast.success("Thanh toán thành công! Gói VIP đã được kích hoạt.");
            window.location.reload(); // Reload to update UI
            onClose();
          }
        } catch (error) {
          console.error("Check status error:", error);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => clearInterval(interval);
  }, [isChecking, paymentCode, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!showPayment ? (
          <>
            {/* Left Side: Value Proposition */}
            <div className="w-full md:w-2/5 bg-gradient-to-br from-yellow-500/10 via-zinc-900 to-zinc-900 p-6 flex flex-col justify-between relative overflow-y-auto md:overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-5 mix-blend-overlay"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold mb-6 border border-yellow-500/20">
                  <Crown className="w-3 h-3" />
                  FILM LEARNING VIP
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Nâng tầm tiếng Anh qua phim ảnh
                </h2>

                <p className="text-gray-400 mb-8">
                  Mở khóa toàn bộ kho phim và các công cụ học tập mạnh mẽ nhất để làm chủ tiếng Anh một cách tự nhiên.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-yellow-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Học không giới hạn</h3>
                      <p className="text-sm text-gray-400">Truy cập toàn bộ kho phim chất lượng cao</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-yellow-500">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Công cụ thông minh</h3>
                      <p className="text-sm text-gray-400">Tra từ, lưu từ và ôn tập dễ dàng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-yellow-500">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Không quảng cáo</h3>
                      <p className="text-sm text-gray-400">Trải nghiệm học tập liền mạch</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Hơn 10,000 người học đã tin tưởng và sử dụng
                </p>
              </div>
            </div>

            {/* Right Side: Plans */}
            <div className="w-full md:w-3/5 bg-zinc-950 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Chọn gói phù hợp với bạn</h3>

                <div className="space-y-4">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedPlan("monthly")}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPlan === "monthly"
                      ? "border-yellow-500 bg-yellow-500/5"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-lg">{plans.monthly.name}</h4>
                        <p className="text-sm text-gray-400">{plans.monthly.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">{plans.monthly.originalPrice}</div>
                        <div className="text-xl font-bold text-yellow-500">{plans.monthly.price}</div>
                        <div className="text-xs text-gray-400">{plans.monthly.period}</div>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Plan */}
                  <div
                    onClick={() => setSelectedPlan("yearly")}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPlan === "yearly"
                      ? "border-yellow-500 bg-yellow-500/5"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                      }`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      PHỔ BIẾN NHẤT
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <h4 className="font-bold text-white text-lg">{plans.yearly.name}</h4>
                        <p className="text-sm text-gray-400">{plans.yearly.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">{plans.yearly.originalPrice}</div>
                        <div className="text-xl font-bold text-yellow-500">{plans.yearly.price}</div>
                        <div className="text-xs text-gray-400">{plans.yearly.period}</div>
                      </div>
                    </div>
                  </div>

                  {/* Lifetime Plan */}
                  <div
                    onClick={() => setSelectedPlan("lifetime")}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPlan === "lifetime"
                      ? "border-yellow-500 bg-yellow-500/5"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-lg">{plans.lifetime.name}</h4>
                        <p className="text-sm text-gray-400">{plans.lifetime.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">{plans.lifetime.originalPrice}</div>
                        <div className="text-xl font-bold text-yellow-500">{plans.lifetime.price}</div>
                        <div className="text-xs text-gray-400">{plans.lifetime.period}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="bg-zinc-900 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider text-gray-500">Quyền lợi gói {plans[selectedPlan].name}</h4>
                    <ul className="space-y-2">
                      {plans[selectedPlan].features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-zinc-800 bg-zinc-950 shrink-0">
                <Button
                  onClick={handlePayment}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-6 text-lg shadow-lg shadow-yellow-500/20"
                >
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Payment View */
          <div className="w-full bg-zinc-950 p-8 flex flex-col items-center justify-center text-center overflow-y-auto">
            <div className="max-w-md w-full">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-500" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Thông tin chuyển khoản</h3>
              <p className="text-gray-400 mb-8">
                Vui lòng chuyển khoản theo thông tin dưới đây để kích hoạt gói <span className="text-yellow-500 font-bold">{plans[selectedPlan].name}</span>
              </p>

              <div className="bg-white p-6 rounded-xl mb-6">
                <img
                  src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${plans[selectedPlan].price.replace(/\D/g, '')}&addInfo=${paymentCode}&accountName=FILM LEARNING`}
                  alt="QR Code"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="bg-zinc-900 rounded-lg p-4 text-left space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngân hàng:</span>
                  <span className="text-white font-bold">MB Bank (Ngân hàng Quân đội)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số tài khoản:</span>
                  <span className="text-white font-bold">0987654321</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chủ tài khoản:</span>
                  <span className="text-white font-bold">NGUYEN VAN A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số tiền:</span>
                  <span className="text-yellow-500 font-bold">{plans[selectedPlan].price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nội dung:</span>
                  <span className="text-white font-mono text-sm bg-zinc-800 px-2 py-1 rounded">{paymentCode}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                  className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Quay lại
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={onClose}
                >
                  Đã chuyển khoản
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Hệ thống đang tự động kiểm tra giao dịch...
                Vui lòng không tắt cửa sổ này.
                Nếu cần hỗ trợ, vui lòng liên hệ Fanpage.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
