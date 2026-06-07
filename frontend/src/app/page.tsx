import { fetchHotels } from "@/lib/api";
import { HotelDashboard } from "@/components/hotels/HotelDashboard";

export default async function DashboardPage() {
  const hotels = await fetchHotels();
  return <HotelDashboard initialHotels={hotels} />;
}
