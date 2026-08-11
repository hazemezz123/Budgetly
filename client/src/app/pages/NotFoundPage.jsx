import React from "react";
import { Link } from "react-router-dom";
import { Home, Frown } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 font-primary">
      <h1 className="text-9xl font-bold text-(--color-primary) opacity-10 select-none">
        404
      </h1>
      <div className="absolute mt-2 flex flex-col items-center">
        <div className=" p-4 rounded-full mb-4 animate-slide-in border-2 border-(--color-primary)">
          <Frown size={48} className="text-(--color-primary)" />
        </div>
        <div className="text-3xl font-bold text-(--color-dark) mb-2 font-cairo">
          انت جيت هنا إزاي؟
        </div>
        <p className="text-xl text-(--color-secondary) mb-8 max-w-md font-cairo leading-relaxed">
          الصفحة دي مش موجودة، شكلها اختفت زي مرتبك أول الشهر بالظبط! 💸
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-(--color-primary) hover:opacity-90 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-bold font-cairo group"
        >
          <Home
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
