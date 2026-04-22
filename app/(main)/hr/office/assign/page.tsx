import { Metadata } from "next";
import OfficeAssignForm from "./Form";

export const metadata: Metadata = {
  title: 'Employee Office Assignment',
  description: 'Employee Office Assignment',
}

const page = async () => {
    return (
      <OfficeAssignForm />
    )
}

export default page