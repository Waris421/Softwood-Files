import { Metadata } from "next";
import ShiftDefineForm from "./Form";

export const metadata: Metadata = {
  title: 'Employee Shift Management',
  description: 'Employee Shift Management',
}

const page = async () => {
    return (
        <ShiftDefineForm />
    )
}

export default page