import { Users, DollarSign, TrendingUp, Facebook } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="pb-8 max-w-4xl mx-auto font-primary">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <img
          src="/assets/logo.png"
          alt="Budgetly Logo"
          className="w-32 mb-4 dark:invert"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* What is Budgetly */}
        <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 text-(--color-dark)">
              إيه هو Budgetly؟
            </h2>
            <p className="leading-relaxed text-(--color-secondary)">
              Budgetly هو تطبيق إدارة المصاريف المشتركة المثالي للأصدقاء والعائلات
              اللي عايشين مع بعض. التطبيق بيساعدك تسجل المصاريف، تتابع المدفوعات،
              وتعرف مين عليه فلوس ومين ليه فلوس بكل سهولة.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-(--color-dark)">
              المميزات الرئيسية
            </h2>
            <div className="space-y-4 ">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-(--color-surface) border border-(--color-border)">
                  <DollarSign
                    size={20}
                    className="text-(--color-primary)"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-(--color-dark)">
                    تسجيل وتقسيم المصاريف
                  </h3>
                  <p className="text-sm text-(--color-secondary)">
                    سجل أي مصروف، حدد مين دفع ومين عليه، والتطبيق هيقسم المبلغ
                    تلقائياً سواء بالتساوي أو بنسب مختلفة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-(--color-surface) border border-(--color-border)">
                  <Users size={20} className="text-(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-(--color-dark)">
                    إدارة أعضاء البيت
                  </h3>
                  <p className="text-sm text-(--color-secondary)">
                    ضيف كل اللي معاك في البيت، وكل واحد هيكون ليه حسابه الخاص عشان
                    يتابع مصاريفه ومدفوعاته.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-(--color-surface) border border-(--color-border)">
                  <TrendingUp
                    size={20}
                    className="text-(--color-primary)"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-(--color-dark)">
                    نظام الفواتير والمدفوعات
                  </h3>
                  <p className="text-sm text-(--color-secondary)">
                    تابع الفواتير المستحقة، سجل الدفعات لما حد يسدد، وشوف كشف حساب
                    كامل لكل عضو.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-(--color-surface) border border-(--color-border)">
                  <Users size={20} className="text-(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-(--color-dark)">
                    المساعد الذكي (AI)
                  </h3>
                  <p className="text-sm text-(--color-secondary)">
                    اسأل مساعد Budgetly الذكي عن أي نصيحة مالية، أو خليه يحللك
                    مصاريفك ويقترح عليك طرق للتوفير.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-(--color-surface) border border-(--color-border)">
                  <Users size={20} className="text-(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-(--color-dark)">
                    الملاحظات المشتركة
                  </h3>
                  <p className="text-sm text-(--color-secondary)">
                    اكتب طلبات البيت، مواعيد الصيانة، أو أي ملاحظات تهم الكل في
                    مكان واحد مشترك.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-(--color-dark)">
              إزاي تستخدم التطبيق؟
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-(--color-primary-text) border border-(--color-primary)">
                  1
                </div>
                <div>
                  <p className="font-semibold text-(--color-dark)">
                    سجل دخول
                  </p>
                  <p className="text-sm text-(--color-secondary)">
                    ادخل على حسابك في البيت اللي انت فيه
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-(--color-primary-text) border border-(--color-primary)">
                  2
                </div>
                <div>
                  <p className="font-semibold text-(--color-dark)">
                    سجل المصاريف
                  </p>
                  <p className="text-sm text-(--color-secondary)">
                    كل ما تشتري حاجة، سجلها في التطبيق ووزعها على الناس
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-(--color-primary-text) border border-(--color-primary)">
                  3
                </div>
                <div>
                  <p className="font-semibold text-(--color-dark)">
                    سجل الدفعات
                  </p>
                  <p className="text-sm text-(--color-secondary)">
                    لما حد يدفع لك فلوس، سجل الدفعة عشان الرصيد يتحدث
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-(--color-primary-text) border border-(--color-primary)">
                  4
                </div>
                <div>
                  <p className="font-semibold text-(--color-dark)">
                    تابع رصيدك
                  </p>
                  <p className="text-sm text-(--color-secondary)">
                    شوف في أي وقت إنت عليك كام أو ليك كام من الرئيسية
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-(--color-dark)">
              نصايح للاستخدام الأمثل
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-(--color-secondary) ">
                <span className="text-(--color-primary-text)">•</span>
                <span>سجل المصاريف أول ما تحصل عشان ما تنساش</span>
              </li>
              <li className="flex items-start gap-2 text-(--color-secondary) ">
                <span className="text-(--color-primary-text)">•</span>
                <span>راجع التحليلات كل شهر عشان تعرف على إيه بتصرف</span>
              </li>
              <li className="flex items-start gap-2 text-(--color-secondary) ">
                <span className="text-(--color-primary-text)">•</span>

                <span>سدد فلوسك بانتظام عشان ما تتجمعش عليك</span>
              </li>
              <li className="flex items-start gap-2 text-(--color-secondary) ">
                <span className="text-(--color-primary-text)">•</span>
                <span>
                  استخدم الفلاتر في صفحة المصاريف لو بتدور على حاجة معينة
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Us Section */}
        <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 text-(--color-dark)">
              تواصل معانا
            </h2>
            <p className="leading-relaxed mb-4 text-(--color-secondary)">
              عندك شكوى، اقتراح، أو ملاحظة؟ نحن نحب نسمع منك! رأيك مهم لينا عشان
              نطور التطبيق ونخليه أفضل.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 rounded-2xl font-semibold"
                style={{
                  backgroundColor: "#25D366",
                  color: "#0b3d2e",
                }}
              >
                <a
                  href="https://wa.me/201005291205"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 واتساب
                </a>
              </Button>
            </div>
            <p className="text-xs text-center mt-3 text-(--color-secondary)">
              هنرد عليك في أسرع وقت ممكن
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
