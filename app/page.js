import MyOrder from "@/components/MyOrder";

export default function Home() {
  
  return (
    <div>
      <main className="p-10">
        <h1 className="text-xl mb-5">Order</h1>
        <MyOrder />
      </main>
    </div>
  );
}
