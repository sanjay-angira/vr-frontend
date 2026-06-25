"use client";

import { useEffect, useState } from "react";
import {
  fetchFooterData,
  getFallbackFooterData,
} from "@/services/website/footerService";
import type { FooterData } from "../../../types/footer";

export function useFooterData() {
  const [footerData, setFooterData] = useState<FooterData>(getFallbackFooterData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchFooterData()
      .then((data) => {
        if (mounted) {
          setFooterData(data);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { footerData, loading };
}
