import { redirect } from 'next/navigation'

export default function NewItemRedirect() {
  redirect('/quick-add')
}
