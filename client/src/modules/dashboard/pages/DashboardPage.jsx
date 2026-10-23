import { Wallet, Loader2 } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import { RoleRotationWidget } from "../../house/components";
import { useDashboardStats } from "../hooks";
import {
  AdminDashboard,
  BalanceCard,
  QuoteCard,
  UserDashboard,
  WelcomeModal,
} from "../components";

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  const houseId =
    typeof user?.house === "object" ? user?.house?._id : user?.house;

  const userBalance =
    user?.role === "admin"
      ? (stats?.overview?.adminBalance ?? 0)
      : (stats?.balance ?? 0);

  const houseName =
    typeof user?.house === "object" ? user?.house?.name : undefined;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-(--color-primary)/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-(--color-primary) animate-spin relative z-10" />
        </div>
        <p className="mt-4 text-(--color-muted) font-medium animate-pulse">
          بنحمّل لوحة التحكم...
        </p>
      </div>
    );

  if (!stats)
    return (
      <div className="text-center p-8 text-(--color-error)" role="alert">
        في مشكلة في تحميل البيانات
      </div>
    );

  return (
    <div className="pb-8 font-primary px-1 sm:px-0" id="main-content">
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="p-2.5 sm:p-3 bg-(--color-primary)/10 rounded-2xl shrink-0">
          <Wallet className="text-(--color-primary)" size={28} aria-hidden="true" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-(--color-dark)">
          الصفحة الرئيسية
        </h1>
      </div>

      <WelcomeModal />

      <div className="mb-4">
        <BalanceCard
          balance={userBalance}
          userName={user?.name || user?.username}
          houseName={houseName}
          role={user?.role}
        />
      </div>

      <div className="mb-6">
        <QuoteCard />
      </div>

      {houseId && (
        <div className="mb-6">
          <RoleRotationWidget houseId={houseId} />
        </div>
      )}

      {user.role === "admin" ? (
        <AdminDashboard stats={stats} />
      ) : (
        <UserDashboard stats={stats} />
      )}
    </div>
  );
};

export default Dashboard;
