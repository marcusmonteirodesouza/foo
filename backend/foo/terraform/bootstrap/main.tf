terraform {
  required_version = "1.0.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.76.0"
    }
  }
  backend "gcs" {
    bucket = "REPLACE_ME via -backend-config"
  }
}

provider "google" {
  project = var.project
  region  = var.region
}

resource "google_app_engine_application" "cloud_firestore" {
  project       = var.project
  location_id   = var.region
  database_type = "CLOUD_FIRESTORE"
}
