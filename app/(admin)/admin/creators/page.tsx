import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CreatorReviewQueue from './CreatorReviewQueue'
import AdminShell from '@/components/layout/AdminShell'

export default async function AdminCreatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/signin')

  const { data: rawCreators } = await adminSupabase
    .from('creators')
    .select(
      `id, display_name, tagline, bio, photo_url, youtube_url, instagram_url, website_url, slug,
       profiles(email),
       creator_tags(specialty_tags(id, name)),
       courses(id, title, external_url, course_type),
       creator_videos(id, title, youtube_url)`
    )
    .eq('status', 'pending_gate2')
    .order('updated_at', { ascending: true })

  const creators = (rawCreators ?? []).map(c => {
    const profileRel = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
    const tags = (c.creator_tags ?? [])
      .map(ct => (Array.isArray(ct.specialty_tags) ? ct.specialty_tags[0] : ct.specialty_tags))
      .filter((t): t is { id: string; name: string } => !!t)
    const courses = (c.courses ?? [])
      .filter(co => co.course_type === 'affiliated')
      .map(co => ({ id: co.id, title: co.title, external_url: co.external_url ?? null }))
    const videos = (c.creator_videos ?? []).map(v => ({
      id: v.id,
      title: v.title ?? null,
      youtube_url: v.youtube_url,
    }))
    return {
      id: c.id,
      display_name: c.display_name,
      tagline: c.tagline,
      bio: c.bio,
      photo_url: c.photo_url,
      youtube_url: c.youtube_url,
      instagram_url: c.instagram_url,
      website_url: c.website_url,
      slug: c.slug,
      email: profileRel?.email ?? null,
      tags,
      courses,
      videos,
    }
  })

  return (
    <AdminShell title="Gate 2 — Profile Review">
      <p className="text-muted-text mb-4">{creators.length} pending</p>
      <CreatorReviewQueue creators={creators} />
    </AdminShell>
  )
}
