"use client";

import { VideoPlayer } from "@/components/VideoPlayer";

// Mock Subtitle Data - Extended List
const subtitles = [
  {
    id: 1,
    startTime: 1,
    endTime: 4,
    en: "Welcome to the Pacific Buoy, a state-of-the-art facility.",
    vi: "Chào mừng đến với Pacific Buoy, một cơ sở hiện đại bậc nhất.",
  },
  {
    id: 2,
    startTime: 4.5,
    endTime: 7,
    en: "Here, we connect security cameras from all over the world.",
    vi: "Tại đây, chúng tôi kết nối camera an ninh từ khắp nơi trên thế giới.",
  },
  {
    id: 3,
    startTime: 7.5,
    endTime: 10,
    en: "Our mission is to ensure global safety through surveillance.",
    vi: "Nhiệm vụ của chúng tôi là đảm bảo an toàn toàn cầu thông qua giám sát.",
  },
  {
    id: 4,
    startTime: 11,
    endTime: 14,
    en: "But something unexpected has happened in Germany.",
    vi: "Nhưng một điều bất ngờ đã xảy ra ở Đức.",
  },
  {
    id: 5,
    startTime: 15,
    endTime: 18,
    en: "We need your help, Conan. The situation is critical.",
    vi: "Chúng tôi cần sự giúp đỡ của cậu, Conan. Tình hình rất nguy cấp.",
  },
  {
    id: 6,
    startTime: 20,
    endTime: 23,
    en: "Wait, I see someone suspicious on monitor 3.",
    vi: "Khoan đã, tớ thấy ai đó khả nghi trên màn hình số 3.",
  },
  {
    id: 7,
    startTime: 24,
    endTime: 27,
    en: "Zoom in on that face. Is that... Gin?",
    vi: "Phóng to khuôn mặt đó lên. Đó có phải là... Gin không?",
  },
  {
    id: 8,
    startTime: 28,
    endTime: 32,
    en: "Impossible! How did the Black Organization find this place?",
    vi: "Không thể nào! Làm sao Tổ chức Áo đen tìm ra nơi này?",
  },
  {
    id: 9,
    startTime: 33,
    endTime: 36,
    en: "They must have hacked into the Interpol network.",
    vi: "Chắc chắn chúng đã hack vào mạng lưới của Interpol.",
  },
  {
    id: 10,
    startTime: 37,
    endTime: 40,
    en: "We have to evacuate everyone immediately!",
    vi: "Chúng ta phải sơ tán mọi người ngay lập tức!",
  },
  {
    id: 11,
    startTime: 42,
    endTime: 45,
    en: "Haibara, stay close to me. Don't let them see you.",
    vi: "Haibara, ở sát bên tớ. Đừng để chúng nhìn thấy cậu.",
  },
  {
    id: 12,
    startTime: 46,
    endTime: 49,
    en: "Don't worry, Kudo-kun. I have my hood up.",
    vi: "Đừng lo, Kudo-kun. Tớ đã trùm mũ rồi.",
  },
  {
    id: 13,
    startTime: 55,
    endTime: 58,
    en: "Look out! There's a sniper on the roof!",
    vi: "Cẩn thận! Có lính bắn tỉa trên mái nhà!",
  },
  {
    id: 14,
    startTime: 60,
    endTime: 63,
    en: "Ran-neechan, get down!",
    vi: "Chị Ran, nằm xuống!",
  },
  {
    id: 15,
    startTime: 65,
    endTime: 68,
    en: "What is happening? Conan-kun, are you okay?",
    vi: "Chuyện gì đang xảy ra vậy? Conan-kun, em có sao không?",
  },
  {
    id: 16,
    startTime: 75,
    endTime: 78,
    en: "Professor Agasa, bring the car around the back!",
    vi: "Tiến sĩ Agasa, lái xe vòng ra phía sau!",
  },
  {
    id: 17,
    startTime: 80,
    endTime: 83,
    en: "I'm on my way, Shinichi... I mean, Conan!",
    vi: "Ta tới ngay đây, Shinichi... à nhầm, Conan!",
  },
  {
    id: 18,
    startTime: 90,
    endTime: 94,
    en: "The submarine is surfacing. They are trying to escape.",
    vi: "Tàu ngầm đang nổi lên. Chúng đang cố gắng trốn thoát.",
  },
  {
    id: 19,
    startTime: 95,
    endTime: 98,
    en: "I won't let them get away with this.",
    vi: "Tớ sẽ không để chúng thoát tội đâu.",
  },
  {
    id: 20,
    startTime: 100,
    endTime: 103,
    en: "Power up the kick shoes! Maximum output!",
    vi: "Kích hoạt giày tăng lực! Công suất tối đa!",
  },
  {
    id: 21,
    startTime: 110,
    endTime: 113,
    en: "Take this! Soccer ball kick!",
    vi: "Nhận lấy này! Cú sút bóng đá!",
  },
  {
    id: 22,
    startTime: 120,
    endTime: 123,
    en: "Did we get them? Is it over?",
    vi: "Chúng ta bắt được chúng chưa? Kết thúc chưa?",
  },
  {
    id: 23,
    startTime: 125,
    endTime: 128,
    en: "Not yet. This is just the beginning.",
    vi: "Chưa đâu. Đây mới chỉ là bắt đầu thôi.",
  },
  {
    id: 24,
    startTime: 135,
    endTime: 138,
    en: "We need to find out what their real target is.",
    vi: "Chúng ta cần tìm ra mục tiêu thực sự của chúng là gì.",
  },
  {
    id: 25,
    startTime: 140,
    endTime: 143,
    en: "Could it be the new facial recognition software?",
    vi: "Liệu có phải là phần mềm nhận diện khuôn mặt mới không?",
  },
  {
    id: 26,
    startTime: 150,
    endTime: 153,
    en: "If they get that, no one will be safe.",
    vi: "Nếu chúng có được nó, sẽ không ai được an toàn cả.",
  },
  {
    id: 27,
    startTime: 160,
    endTime: 163,
    en: "We have to destroy the data before they copy it.",
    vi: "Chúng ta phải phá hủy dữ liệu trước khi chúng sao chép nó.",
  },
  {
    id: 28,
    startTime: 170,
    endTime: 173,
    en: "Amuro-san, are you in position?",
    vi: "Amuro-san, anh đã vào vị trí chưa?",
  },
  {
    id: 29,
    startTime: 175,
    endTime: 178,
    en: "Yes, I'm ready to intercept.",
    vi: "Rồi, tôi đã sẵn sàng đánh chặn.",
  },
  {
    id: 30,
    startTime: 180,
    endTime: 185,
    en: "Let's finish this, once and for all.",
    vi: "Hãy kết thúc chuyện này, một lần và mãi mãi.",
  },
];

export default function WatchPage() {
  return (
    <VideoPlayer
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      title="Thám Tử Lừng Danh Conan: Tàu Ngầm Sắt Màu Đen"
      subTitle="Tập 1: Vụ án bí ẩn tại Tokyo"
      subtitles={subtitles}
      autoPlay
    />
  );
}
