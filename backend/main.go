package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"hotel-api/internal/handlers"
	"hotel-api/internal/store"
)

func main() {
	dataPath := envOr("DATA_PATH", "../data/hotels.json")
	port := envOr("PORT", "8080")

	s, err := store.New(dataPath)
	if err != nil {
		log.Fatalf("loading store: %v", err)
	}

	mux := http.NewServeMux()
	handlers.NewHotels(s).Register(mux)

	addr := ":" + port
	fmt.Printf("Hotel API listening on %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, corsMiddleware(mux)))
}

// corsMiddleware adds permissive CORS headers so the Next.js dev server
// (localhost:3000) can call this API directly from the browser.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
