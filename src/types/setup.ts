
export type SetupStatus = 
  | 'not_started' 
  | 'network_configured' 
  | 'machine_registered' 
  | 'owner_setup' 
  | 'system_configured' 
  | 'completed';

export type MachineMode = 'setup' | 'customer' | 'admin';

export interface MachineSetupStatus {
  id: string;
  machine_serial_number: string;
  current_status: SetupStatus;
  setup_data: Record<string, any>;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface SetupToken {
  id: string;
  machine_serial_number: string;
  token: string;
  token_type: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface OwnerRegistration {
  id: string;
  machine_serial_number: string;
  business_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_pin_code?: string;
  business_type?: string;
  expected_hours?: Record<string, any>;
  verification_status: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SetupWizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isCompleted: boolean;
  isActive: boolean;
}
