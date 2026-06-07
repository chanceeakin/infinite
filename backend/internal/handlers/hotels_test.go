package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"hotel-api/internal/models"
	"hotel-api/internal/store"
)

func newTestStore(t *testing.T) *store.Store {
	t.Helper()
	hotels := []models.Hotel{
		{
			ID: "hotel-01", Name: "Test Grand", StarRating: 5, OverallRating: 4.9, ReviewCount: 1000,
			Address:   models.Address{City: "Chicago", Country: "USA"},
			Amenities: []string{"pool", "spa"},
			Rooms: []models.Room{
				{RoomID: "r01a", Type: "Deluxe King", PricePerNight: 299,
					AvailableDates: []string{"2026-07-10", "2026-07-11"}},
				{RoomID: "r01b", Type: "Standard Queen", PricePerNight: 149,
					AvailableDates: []string{"2026-07-10"}},
			},
		},
		{
			ID: "hotel-02", Name: "Budget Inn", StarRating: 2, OverallRating: 3.5, ReviewCount: 200,
			Address: models.Address{City: "Paris", Country: "France"},
			Rooms: []models.Room{
				{RoomID: "r02a", Type: "Basic Single", PricePerNight: 59,
					AvailableDates: []string{}},
			},
		},
	}

	data, _ := json.Marshal(hotels)
	f, _ := os.CreateTemp(t.TempDir(), "hotels*.json")
	f.Write(data)
	f.Close()

	s, err := store.New(f.Name())
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func newHandler(t *testing.T) *Hotels {
	return NewHotels(newTestStore(t))
}

func TestSearchHotels_ReturnsAll(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status %d", rr.Code)
	}
	var body map[string]any
	json.NewDecoder(rr.Body).Decode(&body)
	if total := int(body["total"].(float64)); total != 2 {
		t.Fatalf("expected total 2, got %d", total)
	}
}

func TestSearchHotels_FilterByCity(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels?city=Chicago", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	var body map[string]any
	json.NewDecoder(rr.Body).Decode(&body)
	hotels := body["hotels"].([]any)
	if len(hotels) != 1 {
		t.Fatalf("expected 1 hotel, got %d", len(hotels))
	}
	first := hotels[0].(map[string]any)
	if first["name"] != "Test Grand" {
		t.Errorf("unexpected hotel: %v", first["name"])
	}
}

func TestSearchHotels_FilterByMinStars(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels?min_stars=4", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	var body map[string]any
	json.NewDecoder(rr.Body).Decode(&body)
	if total := int(body["total"].(float64)); total != 1 {
		t.Fatalf("expected 1 result, got %d", total)
	}
}

func TestGetHotel_Found(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/hotel-01", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status %d", rr.Code)
	}
	var hotel map[string]any
	json.NewDecoder(rr.Body).Decode(&hotel)
	if hotel["id"] != "hotel-01" {
		t.Errorf("expected hotel-01, got %v", hotel["id"])
	}
}

func TestGetHotel_NotFound(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/does-not-exist", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestGetRooms_SingleNight(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/hotel-01/rooms?check_in=2026-07-10&check_out=2026-07-11", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status %d", rr.Code)
	}
	var body map[string]any
	json.NewDecoder(rr.Body).Decode(&body)
	// Both rooms available for a single night
	if total := int(body["total"].(float64)); total != 2 {
		t.Fatalf("expected 2 rooms, got %d", total)
	}
}

func TestGetRooms_MultiNight_PartialAvailability(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/hotel-01/rooms?check_in=2026-07-10&check_out=2026-07-12", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	var body map[string]any
	json.NewDecoder(rr.Body).Decode(&body)
	// r01a has both nights; r01b only has the first
	if total := int(body["total"].(float64)); total != 1 {
		t.Fatalf("expected 1 room, got %d", total)
	}
}

func TestGetRooms_MissingDates(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/hotel-01/rooms", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestGetRooms_InvalidDate(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/hotel-01/rooms?check_in=tomorrow&check_out=2026-07-12", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestGetRooms_HotelNotFound(t *testing.T) {
	h := newHandler(t)
	mux := http.NewServeMux()
	h.Register(mux)

	req := httptest.NewRequest("GET", "/hotels/no-such-hotel/rooms?check_in=2026-07-10&check_out=2026-07-11", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}
