"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [email, setEmail] = useState("");
  const [shouldCheck, setShouldCheck] = useState(false);
  
  const userCheck = useQuery(
    api.userAuth.checkUserExists, 
    shouldCheck ? { email } : "skip"
  );

  const handleCheck = () => {
    if (email) {
      setShouldCheck(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <Card className="max-w-2xl mx-auto bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-green-400">Debug User Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="Enter email to check"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCheck} variant="tactical">
              Check User
            </Button>
          </div>
          
          {userCheck && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">User Check Result:</h3>
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(userCheck, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}