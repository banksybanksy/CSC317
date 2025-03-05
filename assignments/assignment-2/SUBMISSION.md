# CSC 317 Assignment 2 Submission
**Name:** Damian Perez
**Student ID:** 923803696
**GitHub Username:** banksybanksy
**Assignment Number:** 2

# HTML Personal Portfolio Website Assignment
## Description:
This assignment involved creating a personal portfolio website using HTML. The goal was to structure a webpage that introduces myself, my experience, education, and projects in a clear and accessible manner. The website serves as an online resume showcasing my skills, work history, and relevant coursework. The key tasks included:
- Designing a semantic and well-structured HTML layout.
- Including navigation links for different sections (About, Experience, Education, Projects, Contact).
- Using HTML tables and lists to present information effectively.
- Embedding images, a Google Map, and interactive elements.
- Ensuring a responsive design using appropriate HTML tags.

## Approach / What I Did:
As a student working on my first real portfolio website, I wanted to build something that is clean, structured, and easy to navigate, while also showcasing my skills and experience in a professional way. My goal was to create a well-organized, readable HTML layout that I could later enhance with CSS and JavaScript.

I started by breaking down my site into sections that would best represent me:
- About Me → Introduces who I am and what I do.
- Experience → Lists my jobs and relevant experience.
- Education → Displays my academic background in a clear table format.
- Projects → Showcases my work with descriptions of my key projects.
- Contact → Includes a simple contact form so visitors can reach me.

1. Navigation Bar:
   1. I added a fixed navigation bar at the top so users can easily switch between sections without scrolling endlessly.
2. Semantic HTML:
   1. I used <header>, <section>, and <footer> for better structure and SEO.
   2. This makes my page more readable for both humans and search engines.
3. Lists & Tables for Organization:
   1. Ordered lists (<ol>) for work experience to show a timeline.
   2. Tables (<table>) for education to present courses in a structured way.
4. Embedded Images & Media:
   1. I included a profile image and a Google Map to personalize my About Me section.
   2. Why? Because adding visuals makes the site more engaging and professional.
5. Simple, Yet Functional Contact Form:
   1. Users can send me a message directly by filling out the form.
   2. I plan to later improve this with JavaScript validation.


## Code Explanation:
Here are some key elements of my HTML code and their purposes:

#### Navigation Bar
The navigation bar provides easy access to different sections of the portfolio.

```html
<nav>
    <a href="#about">About</a> |
    <a href="#experience">Experience</a> |
    <a href="#education">Education</a> |
    <a href="#projects">Projects</a> |
    <a href="#contact">Contact</a>
</nav>
```
- Uses anchor links (<a> tags) to navigate within the same page.
- Helps users move quickly between different sections.

#### Experience Section (Ordered List Format)
This section outlines my work history in a structured manner.
```html
<section id="experience">
    <h2>Experience</h2>
    <ol>
        <li>
            <strong>Expert, Apple</strong><br>
            <em>December 2024 - Present</em>
        </li>
        <li>
            <strong>Specialist, Apple</strong><br>
            <em>May 2024 - December 2024</em>
        </li>
    </ol>
</section>
```
- Uses an ordered list (<ol>) to represent a chronological order.
- Bold (<strong>) and italic (<em>) formatting improve readability.

#### Education Section (Table Format)
Displays academic achievements in a structured table.

```html
<table>
    <tr>
        <th>Course</th>
        <th>Semester</th>
    </tr>
    <tr>
        <td>Advanced Programming</td>
        <td>Fall 2024</td>
    </tr>
    <tr>
        <td>Data Structures</td>
        <td>Fall 2024</td>
    </tr>
</table>
```
- Uses a table for structured presentation.
- <th> defines column headers (Course, Semester).
- <td> contains actual data about courses.

#### Contact Form
A simple contact form that allows users to send messages.

``` html
<form action="mailto:example@email.com" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br>
    
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea><br>
    
    <button type="submit">Send</button>
</form>
```

- Uses <input> fields for name and email with required validation.
- <textarea> allows users to input a longer message.
- <button> submits the form via email (mailto:).
