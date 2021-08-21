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

resource "google_project_service" "cloud_build_api" {
  project = var.project
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_run_api" {
  project = var.project
  service = "run.googleapis.com"
}

resource "google_project_service" "firestore_api" {
  project = var.project
  service = "firestore.googleapis.com"
}

