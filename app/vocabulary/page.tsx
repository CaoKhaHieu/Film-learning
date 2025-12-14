import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSavedWords } from '@/service/vocabulary';
import { VocabularyListWithLoadMore } from "@/components/VocabularyListWithLoadMore";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Sổ tay từ vựng - Film Learning',
  description: 'Danh sách từ vựng bạn đã lưu trong quá trình học',
};

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const initialWords = await getSavedWords(user.id, 0, 20);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Sổ Tay Từ Vựng
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Ôn tập lại những từ vựng bạn đã lưu. Xem lại ngữ cảnh và phim để ghi nhớ tốt hơn.
          </p>
        </div>

        {/* Vocabulary List */}
        <VocabularyListWithLoadMore
          initialWords={initialWords}
          userId={user.id}
          itemsPerPage={20}
        />
      </div>

      <Footer />
    </main>
  );
}
