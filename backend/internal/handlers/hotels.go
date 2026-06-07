package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"hotel-api/internal/models"
	"hotel-api/internal/store"
)

// Hotels bundles the HTTP handlers for hotel endpoints.
type Hotels struct {
	store *store.Store
}

// NewHotels creates a Hotels handler backed by the given store.
func NewHotels(s *store.Store) *Hotels {
	return &Hotels{store: s}
}

// Register mounts all hotel routes onto mux.
func (h *Hotels) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /hotels", h.searchHotels)
	mux.HandleFunc("GET /hotels/{id}", h.getHotel)
	mux.HandleFunc("GET /hotels/{id}/rooms", h.getRooms)
}

// searchHotels handles GET /hotels
// Query params: city, min_stars, max_stars, min_price, max_price
func (h *Hotels) searchHotels(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := models.HotelFilter{
		City:     q.Get("city"),
		MinStars: parseInt(q.Get("min_stars")),
		MaxStars: parseInt(q.Get("max_stars")),
		MinPrice: parseFloat(q.Get("min_price")),
		MaxPrice: parseFloat(q.Get("max_price")),
	}

	hotels := h.store.SearchHotels(filter)

	writeJSON(w, http.StatusOK, map[string]any{
		"hotels": hotels,
		"total":  len(hotels),
	})
}

// getHotel handles GET /hotels/{id}
func (h *Hotels) getHotel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	hotel, ok := h.store.GetHotel(id)
	if !ok {
		writeError(w, http.StatusNotFound, "hotel not found")
		return
	}
	writeJSON(w, http.StatusOK, hotel)
}

// getRooms handles GET /hotels/{id}/rooms
// Query params: check_in (YYYY-MM-DD), check_out (YYYY-MM-DD)
func (h *Hotels) getRooms(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if _, ok := h.store.GetHotel(id); !ok {
		writeError(w, http.StatusNotFound, "hotel not found")
		return
	}

	checkIn := r.URL.Query().Get("check_in")
	checkOut := r.URL.Query().Get("check_out")

	if checkIn == "" || checkOut == "" {
		writeError(w, http.StatusBadRequest, "check_in and check_out query params are required (YYYY-MM-DD)")
		return
	}

	rooms, err := h.store.GetAvailableRooms(id, checkIn, checkOut)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"rooms":    rooms,
		"total":    len(rooms),
		"hotel_id": id,
		"check_in": checkIn,
		"check_out": checkOut,
	})
}

// writeJSON serialises v as JSON with the given status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// writeError sends a JSON error body.
func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// parseInt parses s as an int; returns 0 on empty or invalid input.
func parseInt(s string) int {
	if s == "" {
		return 0
	}
	v, _ := strconv.Atoi(s)
	return v
}

// parseFloat parses s as a float64; returns 0 on empty or invalid input.
func parseFloat(s string) float64 {
	if s == "" {
		return 0
	}
	v, _ := strconv.ParseFloat(s, 64)
	return v
}
