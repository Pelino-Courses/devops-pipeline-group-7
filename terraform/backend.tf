terraform {
  cloud {
    organization = "GROUP-7"
    
    workspaces {
      name = "devops-pipeline-infrastructure"
    }
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  required_version = ">= 1.0"
}

provider "azurerm" {
  features {}
}
