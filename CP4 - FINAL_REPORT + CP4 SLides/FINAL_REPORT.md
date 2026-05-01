# BeatAI: Guided Beat Generation for Beginner Music Creators

**Krish Golcha, Vishruth Gonur, Inika Sahai, Jihan Karim**  
**App Link:** https://v0-music-and-explanation.vercel.app/

## Abstract

A lot of beginners want to make music but don't really know where to start. Tools like Suno can output a full song from a prompt, but they don't teach you anything about why the song works. On the other hand, ChatGPT can talk about music theory all day but can't actually produce something you can listen to. We built BeatAI to sit somewhere in between: it generates structured beats (intro, verse, chorus) along with short explanations of the musical choices behind them. This paper describes a user study we ran to test whether pairing generation with music theory explanations actually helps beginners learn. We worked with 10 beginner participants using a before-and-after study design. We measured their understanding of five core music concepts (rhythm, instrumentation, and tempo/BPM) before and after interacting with the system. Our results suggest that AI creativity tools work better when they teach as they generate, rather than just producing output.

## Introduction and Related Work

Music creation is a new venture that many artificial intelligence systems are starting to advance in recently. AI music tools have gotten really good in the last couple of years. Suno and Udio can generate a whole track from a single sentence; ChatGPT and Gemini can help with lyrics and song structure. However, if you sat down with a beginner and watched them try to utilize these tools, you start to notice a pattern. Chances are they get an output and they don't enjoy it. From there, they do not know what to do next, so they just regenerate another song. Nothing about the process teaches them why their first prompt didn't work or what a chord progression even is. This reflects a bigger issue. Many of the current music generation tools are a black-box system, providing results with no room to learn or understand actual musical theories.

Prior research in AI music creation focused on improving the quality and coherence of generated outputs. Many of the earlier tools focused on rule-based systems; recent tools utilize deep learning models such as transformers or neural networks. Many of these recent systems focus on the long-term structure of a song along with how to properly model musical sequences. Transformer-based systems, for example, have proven to be highly capable of producing cohesive tunes (Ganapathy).

To this day, many systems prioritize automation rather than user depth. Tonal relationships and structural reasonings are essential elements of music that are often missed in current AI music models. This limits their ability to mirror the creativity that goes into the song writing process. In a similar light, research on unsupervised music representation emphasizes that modern systems poorly model “mid-level music structure” because they cannot repeat patterns or compositions that are foundational to a song (Wang).

From our observations in earlier checkpoints (CP1 and CP2), we noticed that beginners often follow a general pattern when generating music on platforms like Suno or Udio. They generate a track, feel unsatisfied with the music, and then regenerate without understanding what went wrong. This creates a black-box system that can produce good music, but has very little user control. When we compare this to LLM’s like Grok or ChatGPT, these tools can explain musical concepts but fail to produce actual music. As a result, users are forced to switch between tools that do not work well with each other.

This gap is notably important for beginners. Unlike experienced producers, beginners are not just looking for a finished product, but they also want to understand how music works. Prior research in human-AI co-creation suggests that excessive automation can reduce user agency and limit skill development. Interactive systems that provide feedback during the creative process are more effective for both engagement and learning.

BeatAI builds on these insights by combining AI powered generation with proper explanations. The system generates a short audio clip from a user prompt, along with user based settings such as BPM, chord suggestions, and section labels (Intro, Verse, Chorus). The musical output is produced alongside short, targeted explanations that describe why certain musical choices work or don’t work in the piece. Unlike traditional tools, BeatAI does not focus solely on output quality. Instead, it aims to support learning through interaction, helping users connect what they hear to how music is constructed.

The goal of this study is to find out whether this approach, combining generation with explanation, actually improves beginner understanding of music concepts. Rather than asking whether BeatAI produces better music, we focus on whether it helps users learn while creating.

## Method:

### System Description

BeatAI is a web app deployed on Vercel with a backend that calls Gemini. The user enters a prompt describing a mood or theme, like "happy summer vibe" or "melancholic late-night track," and the user then can mess with a bunch of settings like mood, vibe, instruments, BPM etc. There are also demos, so users can hear things before they select them and explanations at the top of each box as well talking about what the setting actually does for the output.

Since the output is an audio clip, users experience the result first and then rely on the explanation layer to understand what is happening inside the track. This makes the explanations even more important. Instead of interacting with structure directly, users can build their understanding by connecting what they hear to what the system explains.

Initially, we had long-winded explanations that were confusing and were completely generated by Grok or ChatGPT. The problem with this was that early user testers (Checkpoint 2 user testing) complained that there were way too many words on the screen, and they often did not understand or even read all the words. This resulted in them not even learning, and simply pressing random buttons till they got a piece they like.

After understanding this, we completely changed the explanations and changed them from multiple paragraphs to one singular paragraph. This way we can still keep technical depth while also making it easier for the audience to understand. Regardless, there were still some complaints that the text was too long, however we made a decision that any shorter text would comprise the learning aspect. As a result we did not make them any shorter

User testing revealed that our system was a success, and students were genuinely understanding basic musical skills. Around 90% of users correctly understood the difference between mood and excitement, and most were able to explain how different parts of a track work together. However, rhythm patterns remained the most difficult area, with many users still struggling to consistently identify the correct drum structure. This validated that while the explanation layer improved understanding overall, rhythm-specific guidance needs further improvement, something aside from basic AI explanations

### Research Question and Hypothesis

Our main research question was whether using BeatAI helps beginners better understand basic music concepts while making a beat. We wanted to see if the app could teach users through interaction, not just generate a track for them. Based on this, we expected users to score higher after using the app, especially on concepts that BeatAI explains directly, such as BPM, mood, excitement, drum patterns, and instrument layering.

### Evaluation Design

We used a simple before-and-after study design. First, participants completed a baseline quiz before using the app. This gave us a starting point for how much they already understood basic music concepts. Then, participants interacted with BeatAI for about 20 minutes, using the app to explore beat generation and learn through the interface. After that, they retook the same quiz so we could measure whether their understanding improved. Users were not shown their earlier scores before retaking the quiz. The whole point was too see if users could actually learn anything by simply playing with music and having fun

### Participants

We selected 10 beginners with little to no music experience. This matched our target audience because BeatAI is designed for people who want to experiment with music but have no experience at all with music or music generation. Our goal was not to test trained musicians, but to see whether the app could help new users build a basic mental model of how beats work.

### Survey Questions/ Question Type

Our quiz had 5 multiple-choice questions focused on the core ideas used inside BeatAI. These questions asked users what BPM controls, how to fix a track that feels thin, the difference between mood and excitement, which drum pattern creates a steady club pulse, and why fewer instruments can sound cleaner for beginners. These questions were chosen by us because they connect directly to the app’s main controls and explanations. By comparing scores before and after using the app, we could see which concepts users learned well and which areas, where users lacked in.

### Measures

In order to measure success we used the quiz scores. There were 5 questions in the quiz and each questions had 4 options, with only one of them being correct. Each user was given a score from 1-5 depending on how many questions they got correct. Quiz scores varied depending on if a student took them before or after using the app. Typically students had lower scores before using the app, and higher scores after using the app, with only one question being frequently missed after the fact compared to 4 frequently missed questions prior to app usage.

### Considerations

Since we only tested 10 people, much of the input we get can help us lean more towards a general correlation rather than an official causation, regardless when looking average scores and the number of frequently missed questions, we can clearly see than average scores increased from 1.6/5 to 3.7/5, and the number of frequently missed questions dropped from 4 to just 1.

## Results:

On the first quiz, we noticed that the average score was only 1.6 out of 5. That means most users were not coming in with a strong understanding of how beats are built. They could listen to music and describe a vibe, but they did not really know the technical pieces that really made a piece come together

The weakest areas initially for users were BPM, rhythm, and layering as only 4 out of 10 users correctly understood that BPM controls the tempo of a track. Drum patterns were also confusing, with only 4 out of 10 users correctly choosing “four on the floor” for a steady club-style pulse. The biggest gap was instrument layering: only 1 out of the 10 users understood that fewer instruments can sound cleaner because there is less overlap between parts.

This means that users had a general understanding of what mood is and how it work, but not a strong mental model for how sound is actually built. They could say something felt energetic or dark, but they struggled to explain what changed inside the track to create that feeling.

After using BeatAI, the results improved. The strongest improvement was in mood vs excitement. Around 90% of users correctly understood that mood controls the emotional color of the track, while excitement controls the energy and fullness. Users also got better at explaining how different parts of a beat work together, especially when the app connected the explanation directly to a setting they had just changed.

However, rhythm was still the weakest area. Even after using the app, some users still struggled with drum patterns and how rhythm creates a specific feel. This tells us that BeatAI’s explanation layer helped overall, but the rhythm explanations need to be clearer and more visual in the next version.

This makes sense, as understanding what “Four on the floor” is and what “Trap Hi-Hats” is very hard for a beginner to understand. It also does not help, that the specific explanation for the “Drum Pattern” setting is somewhat vague. Nevertheless this was something to keep in mind, and a weakness we noticed within our app.

Ultimately the results suggested that BeatAI does help beginners learn basic music concepts while creating. But the learning was not equal across all concepts. Ideas on Mood, excitement and instrument types improved the most, but topics such as rhythm and layering still needed more support.

## Group Takeaways:

Learning music takes consistent effort over a long period of time, and the goal of our app was to create users a gateway for them in order to explore the complex and ever changing field of music and musical theory. Users correlation in musical improvements, demonstrated that our app is somewhat successful in getting users interested in the field, and introduce them to concepts that industry professionals use on a day to day basis

The issue however, is that our app failed to enable musical success across all aspects of music, specifically rhythms and drum patterns. Therefore it is imperative that for future works we revise the thought process behind how we explain to users the difference between certain musical settings.

Regardless, we believe the app has great potential to help a whole new generation of students into getting themselves involved in music, and if 10 people can simply increase their musical knowledge by playing with the app for 20 minutes, then through structured revision, students of all ages can really find a passion with music and really push themselves towards musical success

Ultimately more structured revisions are needed such that we can decide what direction we want to pursue this project in further. We can either make this geared fully towards students, especially students in elementary and middle school, or we can gear the app towards users of all ages. Each direction has its own pros and cons but finding a direction can enable the app to reach its full potential, and really help our audience.

## Limitations:

There are a few limitations we noticed within our study, the first being our sample size is small: 10 total participants with 5 multiple choice questions isn't enough to support a really strong statistical causation, and the results we noticed should be more correlative rather than confirmatory. The session was also short. Whether the knowledge gains in the explanation group actually persist a week later is something this study can't answer.

The baseline was musical knowledge before and after using the app, this keeps the comparison clean but doesn't tell us how BeatAI stacks up against, say, ChatGPT or Suno, however that comparison was done in CP3 and we chose not to repeat it here. Lastly, the prototype itself is incomplete. The current prototype does not support editable representations like MIDI or downloadable songs, all of which limit how much users can directly manipulate the structure of a generated track

## Risks and Ethical Considerations

The most obvious risk with a system like this is that the explanations are generated by an LLM. Since they're generated by a language model, there's a real chance that some of the music theory claims are either oversimplified or just inaccurate, and a beginner has no way to tell. We tried to make sure the explanations are about fairly simple and easy to understand topics (BPM, chord quality, basic structure), but this is something we may want a music educator to look at before scaling the tool. There's also a longer-term question about over-reliance, as a tool that makes the first step easy might also make it less likely that users develop independent intuition.

On the ethics side, we kept data collection minimal. Prompts and outputs were stored in supabase, but they were anonymized so nobody can tell whose prompt is whose. Furthermore no personal data was required to use the tool nor collected in supabase, and all study participants gave verbal consent after being told what we were measuring and why. The structured output and explanation features are also intended to make the system more transparent than typical generators, which is why we collected them in our database so that we can audit them, and potentially train our model to make the explanations more accurate.

## Conclusion and Future Work

BeatAI was built on the idea that beginner-friendly AI music tools should teach as they generate, not just simply output something. Our first ever user-study showed some early signs that this idea could work, since the participants who used our app showed meaningful knowledge gains, created more meaningful music, and could explain their own outputs in concrete musical terms.

There's a lot we want to do next. The most immediate priority is improving the explanation prompts so they consistently cover all five concepts, not just BPM and harmony. After that, we want to run a larger and longer study, ideally with at least 20 participants, a longer quiz, and a delayed test, ideally around a week later, so we can understand retention rates. We'd also like to add downloadable music and MIDI support, so users can actually edit the music they create on platforms of their choice. Users can also use the songs they made in their own videos without having to worry about copyright.

More broadly, we think the lesson here generalizes beyond music. AI tools aimed at beginners in any creative domain, especially music, all probably follow the same formula, which is to help users understand the structure behind what they hear, and then visualize it. From this study, we have learnt that generation alone produces outputs, but explanation is what enables users to build transferable skills that can be applied into the field of music.

## References

- Briot, J. P., Hadjeres, G., & Pachet, F. (2020). *Deep learning techniques for music generation: A survey*. Springer.
- Ganapathy, N. D., et al. (2025). *An agent-based framework for automated higher-voice harmony generation*. arXiv preprint.
- Huang, C. A., et al. (2018). *Music transformer: Generating music with long-term structure*. International Conference on Learning Representations (ICLR).
- Kulesza, T., Burnett, M., Wong, W. K., & Stumpf, S. (2015). *Principles of explanatory debugging to personalize interactive machine learning*. Proceedings of the 20th International Conference on Intelligent User Interfaces.
- Oppenlaender, J. (2022). *The creativity support index: Evaluating AI-assisted creativity tools*. Human–Computer Interaction Journal.
- Wang, T., et al. (2025). *Discovering “words” in music: Unsupervised learning of compositional sparse code for symbolic music*. arXiv preprint.
- OpenAI. (2023). *ChatGPT: Optimizing language models for dialogue*. https://openai.com
- Google. (2023). *Gemini AI model documentation*. https://ai.google.dev
- Suno AI. (2024). *Suno music generation platform*. https://suno.ai
- Udio AI. (2024). *Udio music generation platform*. https://udio.com

## Appendices

### Appendix A: Pre/Post Knowledge Survey

Participants answered the following 5 multiple-choice questions:

- What does BPM control in a track?
- Your track feels “thin.” What should you adjust first?
- What is the difference between mood and excitement?
- Which drum pattern creates a steady club rhythm?
- Why do fewer instruments often sound cleaner?

Each question was scored out of 1 point (total = 5).

### Appendix B: Study Procedure Script

- Participants complete pre-test (5 questions)
- Participants use BeatAI for ~20 minutes
- Participants explore freely (no external instruction)
- Participants complete post-test
- Responses recorded for analysis

### Appendix C: Sample Outputs from BeatAI

https://docs.google.com/document/d/1gVfuGTqPt7VkB5YO1dQJF1xgLI_fX1i2k0LAMoCVfhs/edit?usp=sharing


### Appendix D: Raw Data Summary

- Number of participants: 10
- Pre-test average: 1.6 / 5
- Post-test average: ~3.7 / 5
- Largest improvements: Mood vs excitement, Instrument layering
- Weakest area: Drum pattern recognition

### Appendix E: Example Explanation (From System)

**Example output explanation:**  
“A higher BPM increases the energy of the track, while major chords create a brighter emotional tone. Using fewer instruments reduces overlap and creates a cleaner sound.”

### Appendix F: Full Data for user study + Database

**Google Form for (before using the app)**  
https://docs.google.com/spreadsheets/d/1NnkE33XzeMBfvOxUPAFg1LxGb5Nr8n_HKYGLJNoPVKc/edit?usp=sharing

**Google Form for (after using the app)**  
https://docs.google.com/spreadsheets/d/1NnkE33XzeMBfvOxUPAFg1LxGb5Nr8n_HKYGLJNoPVKc/edit?usp=sharing

**Database/ Total BeatAI responses**  
https://docs.google.com/spreadsheets/d/1Qx-FXM5vpm5A_rC5rGMxxYDYCI6CLuqYOTWzZn1-4g8/edit?usp=sharing
