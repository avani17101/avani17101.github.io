---
permalink: /
title: "About me"
excerpt: "About me"
author_profile: true
redirect_from: 
  * /about/
  * /about.html
---

<a href="{{ '/files/Avani_Gupta_Research_Resume.pdf' | relative_url }}" class="btn btn--large" target="_blank">Curriculum Vitae</a>

Hi, there!
This is Avani Gupta.
Welcome to my web-page.

**A brief Introduction of my journey so far:**

I am currently an **AI Engineer at Reesearch Office, MBZUAI**, where I work on  
**multi-agent social learning**, **LLM evaluation**, and **agentic systems**.  
I recently proposed a **new cooperative MARL training paradigm** and desgined evaluation pipelines using LLM-as-judge and persona-conditioned synthetic data generation.

Previously, I worked as an AI Engineer at a **stealth LLM startup**, where I:

* trained **small LLMs end-to-end** (tokenizer → pretraining → SFT → RLHF),  
* proposed a **novel MLA+GQA hybrid attention mechanism** for long-context reasoning,  
* and built/deployed multiple agents (RAG, SQL, audio-analysis, safety systems) used by **3,500+ users**.

Before that, I was a **Research Associate at G42 Healthcare**, where I helped train a **clinical foundation model** for patient trajectory prediction and contributed data pipelines for **Med42**, a 70B medical LLM now available on HuggingFace.

My research background is rooted in **ML interpretability**.  
At **CVIT, IIIT Hyderabad**, I developed:

* the **concept-sensitivity loss** (higher-order gradients) for shaping model representations — published at **NeurIPS 2023**,  
* a **sensitivity-based disentanglement metric** for intrinsic image decomposition — **Oral + Best Paper Award**, **ICVGIP 2022**,  
* and guided follow-up student-led extensions to **backdoor defense (ICCV 2025)** and **controllable style transfer (ICVGIP 2025)**.

I also explored **NeRF, 3D reconstruction, and human modeling** during my early work at CVIT.

Alongside this, I worked with **IBM Research** on applying RL to dynamic business processes. I developed:

* a **goal-oriented next-best-action system** with custom state/action spaces and DFG-based action masking (leading to a **US patent**, pending grant),  
* and transformers for modeling anomalous IT events (**CODS-COMAD 2024**).

Across roles, I enjoy working at the intersection of **intuitive idea formation, rigorous modeling, and systems-level execution**, and I value research that is both conceptual and practical.

I have published my work in venues including **NeurIPS, ICCV, ICVGIP, COLING, and CODS-COMAD**, with experience spanning **NLP, RL, interpretability, and computer vision**.

---

## Research Vision

My research addresses a fundamental question: **How can we build AI models that learn efficiently, generalize robustly, and align with human values?**

Humans learn quickly from limited samples, generalize across domains, and reason through abstract, interpretable concepts. In contrast, current ML models require massive data, exhibit spurious correlations, struggle to generalize, and lack interpretability. I draw inspiration from human learning to address these limitations through three interconnected research directions:

**Concept-Based Interpretable Learning**: Humans think in abstract concepts (color, shape, texture) that enable sample-efficient learning. I developed concept-sensitivity metrics and concept loss functions that allow models to learn, evaluate, and control abstract knowledge using just a few concept examples. This work enables data-efficient alignment of foundation models by adjusting their latent representations toward desired conceptual directions.

**Collective Multi-Agent Learning**: Inspired by how humans learn from peers' successes and failures, I'm exploring collective survival-based multi-agent reinforcement learning. Agents learning from both successful and failed peers achieve better performance than those trained on only successful ones, suggesting peer learning as a mechanism for alignment without labeled preferences.

**Foundation Model Training & Alignment**: Through end-to-end LLM development (pre-training, fine-tuning, RLHF), I've observed persistent issues with hallucinations, biases, and deceptive reasoning. My work on concept loss and peer learning offers promising directions for aligning foundation models more efficiently and transparently.

**Unified Goal**: I aim to translate human-like abstraction and collective learning into autonomous agents, building AI systems that are efficient, interpretable, and aligned—systems that learn from little data, generalize across domains, and reason through concepts we can understand and control.

---

News
======

## News

### 2025

* **March 2025** — Paper on **Prototype-Guided Backdoor Defense** accepted to *ICCV 2025*.
* **February 2025** — Paper on **Controllable Concept-Guided Style Transfer** accepted to *ICVGIP 2025*.
* **January 2025** — Work on **Building Trust in Clinical LLMs** accepted to *EMNLP 2025*.

### 2024

* **December 2024** — Presented work on multi-agent learning and evaluation pipelines at *MBZUAI Research Office*.
* **February 2024** — Paper **Predicting Business Process Events Under Anomalous IT Errors** published at *CODS-COMAD 2024*.
* **January 2024** — Contributed to release of **Med42 (70B Clinical LLM)** on HuggingFace.

### 2023

* **September 2023** — Paper **Concept Distillation: Leveraging Human-Centered Explanations** accepted to *NeurIPS 2023*.
* **September 2023** — Successfully defended M.S. Thesis at IIIT Hyderabad.

### 2022

* **December 2022** — Received **Best Paper Award** and **Oral Presentation** at *ICVGIP 2022* for work on concept-based disentanglement.
* **October 2022** — Paper **CitRet: Cited Text Span Retrieval** accepted to *COLING 2022*.


  

Work experience
======

* Jun 2025 * Present: MBZUAI — AI Engineer, Research Office  
    * Abu Dhabi, UAE 
===
      * Proposed a novel multi-agent reinforcement learning (MARL) training framework (ongoing).
      * Bridged real-world industry challenges into research problems; identified and connected with faculty collaborators to integrate robust academic and practical insights.
      * Built intelligent agents for the Research Office: including an Email Assistant (handling prioritization, information extraction, drafting, and calendar integration) and automated newsletter-generation tools.
      * Designed LLM-judge pipelines for evaluating QA (correctness, safety, bias) and developed persona-conditioned synthetic data generation systems for scalable, multipersona evaluations.


* April 2024 * Jun 2025: AI Engineer
   * Stealth AI Startup | Abu Dhabi, UAE
===
      * Trained a LLM end to end from scratch for advancing SOTA: from data curation to pre-training to post-training (Supervised Fine-Tuning and Alignment using RLHF) 
      *  Designed LLM with novel attention mechanism, pipelines for data generation.
      * Built an AI Assistant with various tools including advanced multi-modalretrieval,
      utilizing RAPTOR for document summaries and self-re-RAG (using LangChain, FastAPI)
      * Productionized the AI Assistant with Azure OpenAI and Google cloud.
      * Tackled multiple challenges in the AI assistant and built components like content moderation and jailbreak attempts flagging to ensure a robust deployed system.


* March 2023 * March 2024: Research Associate
   * G42 Healthcare | Abu Dhabi, UAE
===
      * Trained a foundation model from scratch in a novel setting to predict procedures,
      diagnosis and medications for patients given medical history and demographics.
      * Used it for chronic disease identification, mortality prediction,re-admission prediction
      and personalised medicine.
      * Orchestrated training dataset (from 10M+ articles) and evaluation of Clinical LLM.
      Outcomes: Med42 released on [HuggingFace](https://huggingface.co/m42-health/med42-70b) and authored [paper](https://arxiv.org/abs/2404.14779).

*  2021, 2022 Research Intern 
  * IBM Research | Bangalore, India
===
    * Worked on forecasting and handling IT errors in Business Processes: [paper](https://dl.acm.org/doi/10.1145/3632410.3632437)

    * Research project on building system for Goal Oriented Next Best Action Prediction in Business Processes using Deep Reinforcement Learning. 
    * Submitted [Paper](https://www.researchgate.net/publication/360462271_Goal-Oriented_Next_Best_Activity_Recommendation_using_Reinforcement_Learning}{Preprint) and US. patent (currently in last stage after signing)


* May 2020 * March 2023: Researcher
  * CVIT, IIIT Hyderabad
===
      * Worked on ML Interpretability applied in Computer Vision and Graphics under Professor P.J. Narayan. 
      * Developed novel interpretability based model evaluation and training methods.
      * Used human centered abstract concepts for model disentanglement evaluation and
      finetuning via a proposed loss function.
      * Concepts helped to align model with human understanding thereby improving model
      generalization.
      * Used concepts to debias for complex biases like age in gender classification and induce
      prior knowledge in a real-world reconstruction problem
      * Also worked in Neural rendering, ray tracing and 3D reconstruction of objects and scenes. Studied NeRF(Neural Radiance fields) line of work. Implemented and reproduced results of several papers in neural rendering.


* Jan 2020* Jan 2021: Independent Study Researcher
  * CVIT, IIIT Hyderabad
===
      * Worked on Realistic Human Body Reconstructions and Digital Humans and temporal stability over 3D animations with Professor Avinash Sharma.


* June * July 2020: Crew Member and Mentee
  * Microsoft | Mars Colonization Program
===
      * Worked on Automated mars rover web game. 
      * Developed the game in Agent Centric way. 
      * Used shortest path-finding algorithms like Collaborative Learning Agents, A*, Dijkstra, Best first search, IDA*, Jump-Point Finders and their bi-directional forms to make the AI rover navigate the mars. 
      * Applied Travelling salesmen algorithm and made the AI agent render multiple destinations in the shortest path avoiding all obstacles. *Built using Object Oriented programming cocepts. Used Jquery, Rafael.js, and HTML, CSS and javascript.
 


* Jan 2020* May 2020: Applied Deep Learning and Software Engineering Intern
  * Scrapshut | Hyderabad
===
      * Developed a web-app using Angular and Django where users can check genuineness of any site by providing it’s URL and get other user’s reviews along with predictions by DL model. 
      * Trained various Deep Learning models like LSTM, XGBoost and CNN on three datasets* Kaggle fake news net, Kaggle: getting real about fake news and Kaggle fake news Prediction. 
      * Also trained a passive aggressive classifier (online learning algorithm) and incorporated user-rated scraped reviews for real time prediction.


* Nov 2019* Jan 2020: RL Researcher
  * Robotics Research Centre 
===
      * Worked on several SOTA RL algorithms in Robotics and Control under Professor Madhav Krishna.
      * Implemented algorithms from Monte-Carlo to PPO, TRPO, DDPG etc from scratch. 
      * Also used open AI gym, RLib, Vowpall wabbit and engines like Gazebo, Mojuco for control in robotics.




