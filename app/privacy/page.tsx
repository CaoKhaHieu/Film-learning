import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: 'Chính Sách Bảo Mật - Film Learning',
  description: 'Chính sách bảo mật thông tin người dùng của Film Learning',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-slate-600">
            Cập nhật lần cuối: Tháng 12, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 space-y-8">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">1. Giới Thiệu</h2>
            <p className="text-slate-700 leading-relaxed">
              Film Learning cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">2. Thông Tin Chúng Tôi Thu Thập</h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">2.1. Thông Tin Cá Nhân</h3>
                <p>Khi bạn đăng ký tài khoản, chúng tôi thu thập:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Họ và tên</li>
                  <li>Địa chỉ email</li>
                  <li>Số điện thoại (nếu có)</li>
                  <li>Mật khẩu (được mã hóa)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">2.2. Thông Tin Sử Dụng</h3>
                <p>Chúng tôi tự động thu thập thông tin về cách bạn sử dụng dịch vụ:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Phim bạn đã xem</li>
                  <li>Thời gian xem</li>
                  <li>Lịch sử tìm kiếm</li>
                  <li>Thiết bị và trình duyệt bạn sử dụng</li>
                  <li>Địa chỉ IP</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">2.3. Thông Tin Thanh Toán</h3>
                <p>
                  Khi bạn mua gói VIP, chúng tôi thu thập thông tin thanh toán thông qua các đối tác thanh toán bảo mật. Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">3. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>Chúng tôi sử dụng thông tin của bạn để:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
                <li>Cá nhân hóa trải nghiệm của bạn</li>
                <li>Gửi thông báo về tài khoản và dịch vụ</li>
                <li>Xử lý thanh toán</li>
                <li>Phân tích và hiểu cách người dùng sử dụng dịch vụ</li>
                <li>Gửi email marketing (chỉ khi bạn đồng ý)</li>
                <li>Phát hiện và ngăn chặn gian lận</li>
                <li>Tuân thủ các nghĩa vụ pháp lý</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">4. Chia Sẻ Thông Tin</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>4.1.</strong> Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.
              </p>
              <p>
                <strong>4.2.</strong> Chúng tôi có thể chia sẻ thông tin với:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nhà cung cấp dịch vụ (hosting, email, thanh toán)</li>
                <li>Đối tác phân tích (Google Analytics)</li>
                <li>Cơ quan pháp luật khi được yêu cầu</li>
              </ul>
              <p>
                <strong>4.3.</strong> Tất cả các bên thứ ba đều phải tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật của chúng tôi.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">5. Bảo Mật Thông Tin</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn ngành:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                <li>Mã hóa mật khẩu với thuật toán bcrypt</li>
                <li>Tường lửa và hệ thống phát hiện xâm nhập</li>
                <li>Kiểm tra bảo mật định kỳ</li>
                <li>Giới hạn quyền truy cập dữ liệu</li>
              </ul>
              <p className="mt-3">
                Tuy nhiên, không có phương thức truyền tải qua internet hoặc lưu trữ điện tử nào là 100% an toàn. Chúng tôi không thể đảm bảo tuyệt đối về bảo mật.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">6. Cookies và Công Nghệ Theo Dõi</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>6.1.</strong> Chúng tôi sử dụng cookies và công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ghi nhớ đăng nhập của bạn</li>
                <li>Hiểu cách bạn sử dụng dịch vụ</li>
                <li>Cải thiện hiệu suất trang web</li>
                <li>Cá nhân hóa nội dung</li>
              </ul>
              <p>
                <strong>6.2.</strong> Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của mình.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">7. Quyền Của Bạn</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>Bạn có quyền:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Truy cập và xem thông tin cá nhân của bạn</li>
                <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu của bạn</li>
                <li>Từ chối nhận email marketing</li>
                <li>Xuất dữ liệu của bạn</li>
                <li>Khiếu nại với cơ quan quản lý</li>
              </ul>
              <p className="mt-3">
                Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:privacy@filmlearning.com" className="text-yellow-600 hover:text-yellow-700 font-medium">privacy@filmlearning.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">8. Lưu Trữ Dữ Liệu</h2>
            <p className="text-slate-700 leading-relaxed">
              Chúng tôi lưu trữ thông tin cá nhân của bạn miễn là tài khoản của bạn còn hoạt động hoặc cần thiết để cung cấp dịch vụ. Sau khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn trong vòng 30 ngày, trừ khi pháp luật yêu cầu lưu trữ lâu hơn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">9. Trẻ Em</h2>
            <p className="text-slate-700 leading-relaxed">
              Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn là cha mẹ hoặc người giám hộ và phát hiện con bạn đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">10. Thay Đổi Chính Sách</h2>
            <p className="text-slate-700 leading-relaxed">
              Chúng tôi có thể cập nhật Chính Sách Bảo Mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày "Cập nhật lần cuối". Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
