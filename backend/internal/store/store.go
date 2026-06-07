package store

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"hotel-api/internal/models"
)

const dateLayout = "2006-01-02"

// Store is an in-memory data store backed by the hotels JSON file.
type Store struct {
	hotels []models.Hotel
	byID   map[string]*models.Hotel
}

// New loads hotels from dataPath and returns a ready Store.
func New(dataPath string) (*Store, error) {
	data, err := os.ReadFile(dataPath)
	if err != nil {
		return nil, fmt.Errorf("reading data file: %w", err)
	}

	var hotels []models.Hotel
	if err := json.Unmarshal(data, &hotels); err != nil {
		return nil, fmt.Errorf("parsing hotel data: %w", err)
	}

	byID := make(map[string]*models.Hotel, len(hotels))
	for i := range hotels {
		byID[hotels[i].ID] = &hotels[i]
	}

	return &Store{hotels: hotels, byID: byID}, nil
}

// SearchHotels returns hotels that match all provided filter criteria.
// Zero values for numeric fields mean "no constraint".
func (s *Store) SearchHotels(f models.HotelFilter) []models.Hotel {
	result := make([]models.Hotel, 0, len(s.hotels))
	for _, h := range s.hotels {
		if f.City != "" && h.Address.City != f.City {
			continue
		}
		if f.MinStars > 0 && h.StarRating < f.MinStars {
			continue
		}
		if f.MaxStars > 0 && h.StarRating > f.MaxStars {
			continue
		}
		if f.MinPrice > 0 || f.MaxPrice > 0 {
			if !hasRoomInPriceRange(h.Rooms, f.MinPrice, f.MaxPrice) {
				continue
			}
		}
		result = append(result, h)
	}
	return result
}

// GetHotel returns the hotel with the given ID, or false if not found.
func (s *Store) GetHotel(id string) (*models.Hotel, bool) {
	h, ok := s.byID[id]
	return h, ok
}

// GetAvailableRooms returns rooms for the given hotel that are available
// for every night from checkIn up to (but not including) checkOut.
// Returns an error if the date strings are invalid or checkIn >= checkOut.
func (s *Store) GetAvailableRooms(hotelID, checkIn, checkOut string) ([]models.Room, error) {
	hotel, ok := s.byID[hotelID]
	if !ok {
		return nil, nil // caller converts to 404
	}

	inDate, err := time.Parse(dateLayout, checkIn)
	if err != nil {
		return nil, fmt.Errorf("invalid check_in %q: expected YYYY-MM-DD", checkIn)
	}
	outDate, err := time.Parse(dateLayout, checkOut)
	if err != nil {
		return nil, fmt.Errorf("invalid check_out %q: expected YYYY-MM-DD", checkOut)
	}
	if !inDate.Before(outDate) {
		return nil, fmt.Errorf("check_out must be after check_in")
	}

	// Build the ordered set of required night dates.
	required := make([]string, 0)
	for d := inDate; d.Before(outDate); d = d.AddDate(0, 0, 1) {
		required = append(required, d.Format(dateLayout))
	}

	result := make([]models.Room, 0, len(hotel.Rooms))
	for _, r := range hotel.Rooms {
		if isAvailable(r.AvailableDates, required) {
			result = append(result, r)
		}
	}
	return result, nil
}

// hasRoomInPriceRange returns true if any room's price falls within [min, max].
// Zero min/max means unconstrained on that side.
func hasRoomInPriceRange(rooms []models.Room, min, max float64) bool {
	for _, r := range rooms {
		aboveMin := min == 0 || r.PricePerNight >= min
		belowMax := max == 0 || r.PricePerNight <= max
		if aboveMin && belowMax {
			return true
		}
	}
	return false
}

// isAvailable returns true if all required date strings appear in available.
func isAvailable(available, required []string) bool {
	set := make(map[string]struct{}, len(available))
	for _, d := range available {
		set[d] = struct{}{}
	}
	for _, d := range required {
		if _, ok := set[d]; !ok {
			return false
		}
	}
	return true
}
