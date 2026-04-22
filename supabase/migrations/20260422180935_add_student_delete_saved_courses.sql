create policy "Students can delete own saved courses"
  on public.student_affiliated_courses
  for delete using (auth.uid() = student_id);
