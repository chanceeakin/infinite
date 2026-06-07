package store

import (
	"encoding/json"
	"os"
	"testing"

	"hotel-api/internal/models"
)

// writeFixture writes a small hotels JSON file to a temp path and returns it.
func writeFixture(t *testing.T, hotels []models.Hotel) string {
	t.Helper()
	data, err := json.Marshal(hotels)
	if err != nil {
		t.Fatal(err)
	}
	f, err := os.CreateTemp(t.TempDir(), "hotels*.json")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := f.Write(data); err != nil {
		t.Fatal(err)
	}
	f.Close()
	return f.Name()
}

func newTestStore(t *testing.T) *Store {
	t.Helper()
	hotels := []models.Hotel{
		{
			ID: "h1", Name: "Alpha", StarRating: 5, OverallRating: 4.8, ReviewCount: 100,
			Address: models.Address{City: "Chicago", Country: "USA"},
			Rooms: []models.Room{
				{RoomID: "r1a", Type: "Deluxe King", PricePerNight: 299,
					AvailableDates: []string{"2026-07-10", "2026-07-11", "2026-07-12"}},
				{RoomID: "r1b", Type: "Standard Queen", PricePerNight: 149,
					AvailableDates: []string{"2026-07-10"}},
			},
		},
		{
			ID: "h2", Name: "Beta", StarRating: 3, OverallRating: 3.9, ReviewCount: 50,
			Address: models.Address{City: "Paris", Country: "France"},
			Rooms: []models.Room{
				{RoomID: "r2a", Type: "Classic Room", PricePerNight: 99,
					AvailableDates: []string{"2026-07-10", "2026-07-11"}},
			},
		},
		{
			ID: "h3", Name: "Gamma", StarRating: 4, OverallRating: 4.2, ReviewCount: 200,
			Address: models.Address{City: "Chicago", Country: "USA"},
			Rooms: []models.Room{
				{RoomID: "r3a", Type: "Suite", PricePerNight: 450,
					AvailableDates: []string{}},
			},
		},
	}
	path := writeFixture(t, hotels)
	s, err := New(path)
	if err != nil {
		t.Fatalf("store.New: %v", err)
	}
	return s
}

func TestNew_InvalidPath(t *testing.T) {
	_, err := New("/nonexistent/path/hotels.json")
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestNew_InvalidJSON(t *testing.T) {
	f, _ := os.CreateTemp(t.TempDir(), "bad*.json")
	f.WriteString("not json")
	f.Close()
	_, err := New(f.Name())
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestSearchHotels_NoFilter(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{})
	if len(got) != 3 {
		t.Fatalf("expected 3 hotels, got %d", len(got))
	}
}

func TestSearchHotels_FilterByCity(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{City: "Chicago"})
	if len(got) != 2 {
		t.Fatalf("expected 2 Chicago hotels, got %d", len(got))
	}
	for _, h := range got {
		if h.Address.City != "Chicago" {
			t.Errorf("unexpected city %q", h.Address.City)
		}
	}
}

func TestSearchHotels_FilterByMinStars(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{MinStars: 4})
	if len(got) != 2 {
		t.Fatalf("expected 2 hotels with >=4 stars, got %d", len(got))
	}
}

func TestSearchHotels_FilterByMaxStars(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{MaxStars: 3})
	if len(got) != 1 {
		t.Fatalf("expected 1 hotel with <=3 stars, got %d", len(got))
	}
	if got[0].ID != "h2" {
		t.Errorf("expected h2, got %s", got[0].ID)
	}
}

func TestSearchHotels_FilterByPriceRange(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{MinPrice: 100, MaxPrice: 300})
	// h1 has rooms at 299 and 149 — both in range; h3 has 450 — out of range; h2 has 99 — out of range
	if len(got) != 1 {
		t.Fatalf("expected 1 hotel in $100–$300 range, got %d", len(got))
	}
	if got[0].ID != "h1" {
		t.Errorf("expected h1, got %s", got[0].ID)
	}
}

func TestSearchHotels_CombinedFilters(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{City: "Chicago", MinStars: 5})
	if len(got) != 1 || got[0].ID != "h1" {
		t.Fatalf("expected only h1, got %+v", got)
	}
}

func TestSearchHotels_NoMatch(t *testing.T) {
	s := newTestStore(t)
	got := s.SearchHotels(models.HotelFilter{City: "Tokyo"})
	if len(got) != 0 {
		t.Fatalf("expected 0, got %d", len(got))
	}
}

func TestGetHotel_Found(t *testing.T) {
	s := newTestStore(t)
	h, ok := s.GetHotel("h1")
	if !ok || h.Name != "Alpha" {
		t.Fatalf("expected Alpha, got %+v", h)
	}
}

func TestGetHotel_NotFound(t *testing.T) {
	s := newTestStore(t)
	_, ok := s.GetHotel("not-a-real-id")
	if ok {
		t.Fatal("expected not found")
	}
}

func TestGetAvailableRooms_SingleNight(t *testing.T) {
	s := newTestStore(t)
	rooms, err := s.GetAvailableRooms("h1", "2026-07-10", "2026-07-11")
	if err != nil {
		t.Fatal(err)
	}
	// r1a and r1b both have 2026-07-10
	if len(rooms) != 2 {
		t.Fatalf("expected 2 rooms, got %d", len(rooms))
	}
}

func TestGetAvailableRooms_MultiNight(t *testing.T) {
	s := newTestStore(t)
	rooms, err := s.GetAvailableRooms("h1", "2026-07-10", "2026-07-13")
	if err != nil {
		t.Fatal(err)
	}
	// r1a has all three nights; r1b only has 07-10
	if len(rooms) != 1 || rooms[0].RoomID != "r1a" {
		t.Fatalf("expected only r1a, got %+v", rooms)
	}
}

func TestGetAvailableRooms_NoDatesMatch(t *testing.T) {
	s := newTestStore(t)
	rooms, err := s.GetAvailableRooms("h3", "2026-07-10", "2026-07-11")
	if err != nil {
		t.Fatal(err)
	}
	if len(rooms) != 0 {
		t.Fatalf("expected 0 rooms, got %d", len(rooms))
	}
}

func TestGetAvailableRooms_InvalidCheckIn(t *testing.T) {
	s := newTestStore(t)
	_, err := s.GetAvailableRooms("h1", "not-a-date", "2026-07-11")
	if err == nil {
		t.Fatal("expected error for invalid check_in")
	}
}

func TestGetAvailableRooms_CheckOutNotAfterCheckIn(t *testing.T) {
	s := newTestStore(t)
	_, err := s.GetAvailableRooms("h1", "2026-07-12", "2026-07-10")
	if err == nil {
		t.Fatal("expected error when check_out <= check_in")
	}
}

func TestGetAvailableRooms_HotelNotFound(t *testing.T) {
	s := newTestStore(t)
	rooms, err := s.GetAvailableRooms("no-such-hotel", "2026-07-10", "2026-07-11")
	if err != nil {
		t.Fatal(err)
	}
	if rooms != nil {
		t.Fatal("expected nil for missing hotel")
	}
}
