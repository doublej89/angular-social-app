export interface Profile {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  handle: string;
  company: string;
  location: string;
  gender: string;
  bio: string;
  experience: {
    title: string;
    company: string;
    location: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    fieldofstudy: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;
  }[];
  date: Date;
}
