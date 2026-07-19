import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{ order?: string }> | { order?: string };
};

export default async function OrderSuccessPage({ searchParams }: Props) {
  const params = await Promise.resolve(searchParams);
  const order = params?.order ? encodeURIComponent(params.order) : "";
  redirect(order ? `/thank-you?order=${order}` : "/thank-you");
}
