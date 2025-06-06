
// Default machine credentials for testing and initial setup
export interface DefaultCredentials {
  serialNumber: string;
  email: string;
  password: string;
  venueName: string;
  city: string;
  state: string;
}

export const DEFAULT_MACHINE_CREDENTIALS: DefaultCredentials[] = [
  {
    serialNumber: 'VRX001DEL',
    email: 'admin@vrx001del.vr',
    password: 'Admin123!',
    venueName: 'VR Arena Delhi',
    city: 'Delhi',
    state: 'Delhi'
  },
  {
    serialNumber: 'VRX002MUM',
    email: 'admin@vrx002mum.vr',
    password: 'Admin123!',
    venueName: 'Gaming Zone Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  {
    serialNumber: 'VRX003BLR',
    email: 'admin@vrx003blr.vr',
    password: 'Admin123!',
    venueName: 'Tech Hub Bangalore',
    city: 'Bangalore',
    state: 'Karnataka'
  },
  {
    serialNumber: 'VRX004CHE',
    email: 'admin@vrx004che.vr',
    password: 'Admin123!',
    venueName: 'VR World Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu'
  },
  {
    serialNumber: 'VRX005HYD',
    email: 'admin@vrx005hyd.vr',
    password: 'Admin123!',
    venueName: 'Future Gaming Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana'
  },
  {
    serialNumber: 'VRX008CHN',
    email: 'admin@vrx008chn.vr',
    password: 'Admin123!',
    venueName: 'VR Experience Chandigarh',
    city: 'Chandigarh',
    state: 'Punjab'
  },
  {
    serialNumber: 'VRX009BLR',
    email: 'admin@vrx009blr.vr',
    password: 'Admin123!',
    venueName: 'Gaming Paradise Bangalore',
    city: 'Bangalore',
    state: 'Karnataka'
  }
];

export const getCredentialsBySerialNumber = (serialNumber: string): DefaultCredentials | undefined => {
  return DEFAULT_MACHINE_CREDENTIALS.find(
    cred => cred.serialNumber.toUpperCase() === serialNumber.toUpperCase()
  );
};

export const getCredentialsByEmail = (email: string): DefaultCredentials | undefined => {
  return DEFAULT_MACHINE_CREDENTIALS.find(
    cred => cred.email.toLowerCase() === email.toLowerCase()
  );
};

export const isDefaultCredential = (email: string, password: string, serialNumber: string): boolean => {
  const credential = getCredentialsBySerialNumber(serialNumber);
  return credential ? 
    credential.email.toLowerCase() === email.toLowerCase() && 
    credential.password === password : 
    false;
};
