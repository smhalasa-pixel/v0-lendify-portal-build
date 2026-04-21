import { redirect } from "next/navigation"

// Pipeline has been replaced by the Calls Command Center.
export default function PipelineRedirect() {
  redirect("/calls")
}
