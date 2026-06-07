package models

// Address is a physical location.
type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code"`
	Country string `json:"country"`
}

// Contact holds phone and email for a property.
type Contact struct {
	Phone string `json:"phone"`
	Email string `json:"email"`
}

// Policy describes check-in/out and cancellation terms.
type Policy struct {
	CheckInTime  string `json:"check_in_time"`
	CheckOutTime string `json:"check_out_time"`
	Cancellation string `json:"cancellation"`
}

// Room is a bookable room type within a hotel.
type Room struct {
	RoomID         string   `json:"room_id"`
	Type           string   `json:"type"`
	BedType        string   `json:"bed_type"`
	BedCount       int      `json:"bed_count"`
	MaxOccupancy   int      `json:"max_occupancy"`
	SquareFootage  int      `json:"square_footage"`
	PricePerNight  float64  `json:"price_per_night"`
	RoomAmenities  []string `json:"room_amenities"`
	AvailableDates []string `json:"available_dates"`
}

// Hotel is a full property record.
type Hotel struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	StarRating    int      `json:"star_rating"`
	OverallRating float64  `json:"overall_rating"`
	ReviewCount   int      `json:"review_count"`
	Address       Address  `json:"address"`
	Contact       Contact  `json:"contact"`
	Amenities     []string `json:"amenities"`
	Policies      Policy   `json:"policies"`
	Rooms         []Room   `json:"rooms"`
}

// HotelFilter holds optional search criteria for SearchHotels.
type HotelFilter struct {
	City     string
	MinStars int
	MaxStars int
	MinPrice float64
	MaxPrice float64
}
