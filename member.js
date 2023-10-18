function skillsMember() {
  const skills = document.querySelectorAll('.skill');
  const skillsArray = Array.from(skills);
  skillsArray.forEach((skill) => {
    skill.addEventListener('click', (event) => {
      event.currentTarget.classList.toggle('skill-selected');
    });
  });
}

