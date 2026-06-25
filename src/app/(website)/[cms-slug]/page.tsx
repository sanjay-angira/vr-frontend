export default function Page({ params }: { params: { cmsSlug: string } }) {
  return (
    <div>
      <h1>CMS Page {params.cmsSlug}</h1>
    </div>
  );
}
