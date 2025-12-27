import DropDown from "@/_components/Dropdown/Dropdown"

const Page = () => {
  return (
    <div>
      <h1>Welcome</h1>
      <DropDown 
        apiUrl="/api/inventory"
        inputName="inventory"
        placeholder="Search inventory..."
      />
    </div>
  )
}

export default Page