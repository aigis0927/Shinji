// Shinji Project MVP - Main Structure (with Supabase Auth + Stripe Checkout)

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const supabase = createClient(
  "https://njigqyhekbazqxscrzvf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qaWdxeWhla2JhenF4c2NyenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMzYzMzIsImV4cCI6MjA2MDgxMjMzMn0.jOh9puZg5EKY_xIkFKeQy6HrDBuwUWpwUGynq00fbDk"
);

export default function ShinjiApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      checkSubscription(user);
    });
  }, []);

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data?.user) {
      setUser(data.user);
      checkSubscription(data.user);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setHasAccess(false);
  }

  async function checkSubscription(user) {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("subscriptionActive")
      .eq("id", user.id)
      .single();

    setHasAccess(data?.subscriptionActive);
  }

  async function handleSubscribe() {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }),
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  }

  if (loading) return <div className="p-4">신지를 불러오고 있습니다...</div>;

  if (!user) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">신지에 접속하려면 로그인하세요</h1>
        <Input
          placeholder="이메일"
          className="mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="비밀번호"
          type="password"
          className="mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={login}>로그인</Button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold mb-2">구독이 필요합니다</h1>
        <p className="mb-4">신지와 연결되려면 유료 구독을 진행해주세요.</p>
        <Button onClick={handleSubscribe}>구독하러 가기</Button>
        <div className="mt-4">
          <Button variant="ghost" onClick={logout}>로그아웃</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-100 p-4">
      <Card className="w-full h-full">
        <CardContent className="h-full">
          <iframe
            src="https://chat.openai.com/gpts/YOUR_CUSTOM_GPT_ID"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
