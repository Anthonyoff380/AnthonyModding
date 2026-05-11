"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Shield, MessageCircle, Lock } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function AdminLoginPage() {
  const handleDiscordLogin = () => {
    signIn("discord", { callbackUrl: "/admin" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <div className="p-8 rounded-2xl bg-dark-800 border border-dark-700 text-center">
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-brand-red" />
            <h1 className="font-display text-2xl font-bold text-white">
              Panel Admin
            </h1>
          </div>

          <p className="text-gray-400 text-sm mb-8">
            Connectez-vous avec Discord pour accéder au panel d&apos;administration.
          </p>

          {/* Discord Login Button */}
          <button
            onClick={handleDiscordLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#d14d02] hover:bg-[#ff6005] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#d14d02]/30 mb-6"
          >
            <MessageCircle className="w-5 h-5" />
            Se connecter avec Discord
          </button>

          {/* Info */}
          <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-600">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Accès restreint</span>
            </div>
            <p className="text-xs text-gray-400">
              Seuls les administrateurs autorisés peuvent accéder à ce panel.
              L&apos;accès est vérifié via votre ID Discord.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
