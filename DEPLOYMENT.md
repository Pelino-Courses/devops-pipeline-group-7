# Deployment Guide - Microsoft Azure for Students

This guide will walk you through deploying your DevOps pipeline to Microsoft Azure.

## Prerequisites

- Azure for Students account (free credits)
- GitHub account with this repository
- SSH key pair for VM access
- Azure CLI installed locally (optional for manual operations)

## Step 1: Azure Credentials Setup

### 1.1 Login to Azure Portal
1. Go to https://portal.azure.com
2. Sign in with your student account

### 1.2 Create Service Principal
Run these commands in Azure Cloud Shell (accessible from portal):

```bash
# Login to Azure
az login

# Create service principal with contributor role
az ad sp create-for-rbac --name "devops-pipeline-sp" --role="Contributor" --scopes="/subscriptions/YOUR_SUBSCRIPTION_ID"
```

**Save the output** - you'll need:
- `appId` (Client ID)
- `password` (Client Secret)
- `tenant` (Tenant ID)

### 1.3 Get Subscription ID
```bash
az account show --query id -o tsv
```

## Step 2: GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `ARM_CLIENT_ID` | Service Principal App ID | From Step 1.2 |
| `ARM_CLIENT_SECRET` | Service Principal Password | From Step 1.2 |
| `ARM_TENANT_ID` | Tenant ID | From Step 1.2 |
| `ARM_SUBSCRIPTION_ID` | Subscription ID | From Step 1.3 |
| `TF_API_TOKEN` | Terraform Cloud Token | Create at app.terraform.io |
| `SSH_PUBLIC_KEY` | Your SSH public key | From `~/.ssh/id_rsa.pub` |
| `VM_PUBLIC_IP` | (Add after deployment) | From Terraform output |

### 2.1 Generate SSH Key (if needed)
```bash
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"
cat ~/.ssh/id_rsa.pub
```

### 2.2 Set up Terraform Cloud
1. Go to https://app.terraform.io
2. Create account and organization
3. Create workspace: `devops-pipeline-infrastructure`
4. Generate API token: User Settings → Tokens
5. Add `TF_API_TOKEN` to GitHub Secrets

## Step 3: Deploy Infrastructure with Terraform

### Option A: Via GitHub Actions (Recommended)

1. Commit and push your changes:
```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

2. Go to GitHub Actions tab
3. Find the "Terraform Infrastructure" workflow
4. The workflow will automatically run and deploy your infrastructure

### Option B: Manual Deployment

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

## Step 4: Run Ansible Configuration

After Terraform completes:

### 4.1 Get VM IP Address
From GitHub Actions output or:
```bash
cd terraform
terraform output vm_public_ip
```

### 4.2 Test SSH Connection
```bash
ssh azureuser@<VM_PUBLIC_IP>
```

### 4.3 Run Ansible Playbook
In WSL/Linux:
```bash
cd ansible
ansible-playbook playbooks/setup-server.yml -i inventory/azure_rm.yml
```

## Step 5: Verify Deployment

### 5.1 Check Application Health
```bash
curl http://<VM_PUBLIC_IP>:3000/health
```

### 5.2 Access Application
Open browser to:
- Frontend: `http://<VM_PUBLIC_IP>`
- Backend API: `http://<VM_PUBLIC_IP>:3000`

## Troubleshooting

### Issue: Terraform fails with authentication error
**Solution**: Verify GitHub Secrets are correct and Service Principal has Contributor role

### Issue: Ansible cannot connect
**Solution**: 
1. Verify VM is running: `az vm list -o table`
2. Check NSG rules allow SSH (port 22)
3. Verify SSH key is correct

### Issue: Application not accessible
**Solution**:
1. Check NSG allows ports 80, 443, 3000
2. Verify containers are running: `docker ps`
3. Check firewall: `sudo ufw status`

## Cleanup (To Avoid Charges)

When done with the project:

```bash
# Destroy infrastructure
cd terraform
terraform destroy

# Or via GitHub Actions
# Create workflow_dispatch event for destroy job
```

## Cost Monitoring

- Check Azure Cost Management in portal
- Set up budget alerts
- Monitor resource usage
- Azure for Students provides $100 credit
