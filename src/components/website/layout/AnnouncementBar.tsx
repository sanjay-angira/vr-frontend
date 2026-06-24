"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useFooterData } from "@/components/website/hooks/useFooterData";

export function AnnouncementBar() {
  const { footerData } = useFooterData();
  const { settings } = footerData;

  const phone = settings?.phone || "+91 9876543210";
  const email = settings?.email || "info@vrindavanrasa.com";
  const address = settings?.address || "Vrindavan, India";

  return (
    <div className="announcement-bar">
      <div className="container">
        <div className="announcement-bar-content">
          <div className="announcement-bar-left">
            <div className="announcement-bar-item">
              <Phone size={16} className="announcement-bar-icon" />
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="announcement-bar-text"
              >
                {phone}
              </a>
            </div>
            <div className="announcement-bar-item">
              <Mail size={16} className="announcement-bar-icon" />
              <a href={`mailto:${email}`} className="announcement-bar-text">
                {email}
              </a>
            </div>
          </div>
          <div className="announcement-bar-right">
            <div className="announcement-bar-item">
              <MapPin size={16} className="announcement-bar-icon" />
              <span className="announcement-bar-text">{address}</span>
            </div>
            <div className="announcement-bar-item">
              <Clock size={16} className="announcement-bar-icon" />
              <span className="announcement-bar-text">Mon-Sat: 9AM-8PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
