import { WebsiteProgressBar } from "@/components/website/shared/WebsiteProgressBar";
import AuthModals from "@/components/website/auth/AuthModals";
import { WebsiteFooter } from "@/components/website/footer/WebsiteFooter";
import { WebsiteHeader } from "@/components/website/header/WebsiteHeader";
import { CartHydrator } from "@/components/website/cart/CartHydrator";
import { WishlistHydrator } from "@/components/website/wishlist/useWishlist";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type WebsiteShellProps = {
  children: React.ReactNode;
};

export function WebsiteShell({ children }: WebsiteShellProps) {
  return (
    <div className="website-layout">
      <WebsiteProgressBar />
      <CartHydrator />
      <WishlistHydrator />
      <AuthModals />
      <WebsiteHeader />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 10000 }}
      />
    </div>
  );
}
