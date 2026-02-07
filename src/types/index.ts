export interface Organization {
  orgName: string;
  needs: Need[];
}

export interface Need {
  name: string;
  link: string;
}
