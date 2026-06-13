# Halo Bunda — Architecture & Flow Diagrams

## 1. Application Architecture

```mermaid
graph TB
    subgraph Browser["🌐 Browser (PWA)"]
        subgraph Layouts["Layout Layer"]
            AH[AppHeader<br/>Mobile Top Bar]
            AS[AppSidebar<br/>Desktop Sidebar]
            BN[BottomNav<br/>Mobile Bottom Nav]
        end

        subgraph Pages["Page Layer"]
            PT[PilarTab<br/>Home]
            PG[ProgressTab<br/>Progress]
            TT[ToolsTab<br/>Tools]
            PF[ProfileTab<br/>Profile]
            
            subgraph SubPages["Sub Pages"]
                AP[AktivitasPage]
                AD[AktivitasDetailPage]
                SR[StoryReader]
                RR[RoleplayReader]
                PR[PuzzleReader]
                PJR[ProjectReader]
                CP[ChallengePage]
                JP[JadwalPage]
                CLP[ChecklistPage]
                RP[ReferralPage]
                POT[PoinTab]
            end
        end

        subgraph Components["Shared Components"]
            AB[AppButton]
            AM[AppModal]
            AI[AppInput]
            AC[AppCheckbox]
            AR[AppRadio]
            ARN[AppRange]
            AS2[AppSelect]
            AT[AppTextarea]
            AT2[AppToggle]
            ANS[AnakSelector]
            SC[ShareCard]
            SCC[ShareChecklistCard]
        end

        subgraph Stores["State Management (Pinia)"]
            APS[appStore<br/>Tab, Navigation]
            ANS2[anakStore<br/>Children]
            TS[toolsStore<br/>Challenges, Schedules]
        end

        subgraph Data["Data Layer"]
            DB[(Dexie.js<br/>IndexedDB)]
            PIL[pilars.js]
            CHL[challenge.js]
            EVL[evaluasi.js]
        end

        subgraph Utils["Utilities"]
            AGE[age.js]
            SHR[share.js]
            SND[sound.js]
        end

        subgraph APIs["Browser APIs"]
            TTS[Web Speech API]
            WAU[Web Audio API]
            WSA[Web Share API]
            CLP2[Clipboard API]
            HIS[History API]
        end
    end

    Layouts --> Pages
    Pages --> Components
    Pages --> Stores
    Stores --> Data
    Pages --> Utils
    Utils --> APIs
    Pages --> APIs
```

## 2. Navigation Flow

```mermaid
stateDiagram-v2
    [*] --> AppEntry

    state AppEntry <<choice>>
    AppEntry --> ReferralPage : URL has ?ref=
    AppEntry --> MainApp : Normal access

    state MainApp {
        [*] --> PilarTab

        state "Tab Navigation" as TabNav {
            PilarTab
            ProgressTab
            ToolsTab
            ProfileTab
            ChallengePage2 : ChallengePage
            JadwalPage2 : JadwalPage
            ChecklistPage2 : ChecklistPage
            PoinTab
        }

        state PilarTab {
            [*] --> PilarGrid
            PilarGrid --> SubSkillList : Click Pillar
            SubSkillList --> AktivitasPage : Click Sub-skill
            AktivitasPage --> AktivitasDetailPage : Click Activity Type

            state AktivitasDetailPage {
                [*] --> ActivityRouter
                ActivityRouter --> StoryReader : Story
                ActivityRouter --> RoleplayReader : Roleplay
                ActivityRouter --> PuzzleReader : Puzzle
                ActivityRouter --> ProjectReader : Project
                ActivityRouter --> OtherDetail : Other Types
            }
        }

        state ProgressTab {
            [*] --> ChildCards
            ChildCards --> SkillProgress : Expand Child
            SkillProgress --> EvalModal : Click Evaluasi
            EvalModal --> SkillProgress : Submit
            SkillProgress --> ShareProgress : Click Bagikan
        }

        state ToolsTab {
            [*] --> AnakSelector
            AnakSelector --> ChallengeView
            AnakSelector --> JadwalView
            AnakSelector --> ChecklistView
        }

        state ProfileTab {
            [*] --> UserProfile
            UserProfile --> ChildMgmt : Manage Children
            UserProfile --> Billing : Billing Plans
            UserProfile --> Referral : Referral
        }
    }

    ReferralPage --> MainApp : Click CTA
```

## 3. Home Page (Pilar) Detailed Flow

```mermaid
flowchart TD
    START([User Opens App]) --> HOME[PilarTab - Home Page]
    
    HOME --> GRID[8 Pillar Cards Grid]
    
    GRID --> |Click Pillar| EXPAND[Inline Expand Sub-skills]
    EXPAND --> |4 Sub-skills shown| SUB[Sub-skill Card]
    
    SUB --> |Click Sub-skill| ACT[AktivitasPage]
    ACT --> |9 Activity Types| TYPE[Activity Type Card]
    
    TYPE --> |Click Activity| DETAIL[AktivitasDetailPage]
    
    DETAIL --> ROUTER{Activity Feature Type?}
    
    ROUTER --> |story| STORY[StoryReader Modal]
    STORY --> SWIPE[Swipe Pages]
    SWIPE --> TTS1[🔊 TTS Read Aloud]
    SWIPE --> DONE1[All Pages Read?]
    DONE1 --> |Yes| CELEB1[🎉 Celebration Screen]
    CELEB1 --> MORAL[Moral Lesson]
    MORAL --> CLOSE1[Close Modal]
    
    ROUTER --> |roleplay| ROLE[RoleplayReader Modal]
    ROLE --> CHAT[Chat Bubble Dialog]
    CHAT --> TTS2[🔊 TTS per Character]
    CHAT --> DONE2[Dialog Complete?]
    DONE2 --> |Yes| CLOSE2[Close Modal]
    
    ROUTER --> |puzzle| PUZZLE[PuzzleReader Modal]
    PUZZLE --> QUEST[Show Question]
    QUEST --> HINT[Show Hint/Answer]
    QUEST --> ANSWER[Benar / Salah]
    ANSWER --> SCORE[Score Circle]
    SCORE --> EVAL{Pass?}
    EVAL --> |Yes| PASS[✅ Lulus]
    EVAL --> |No| RETRY[🔄 Coba Lagi]
    
    ROUTER --> |project| PROJ[ProjectReader Modal]
    PROJ --> MAT[Materials Page]
    MAT --> STEP[Step-by-Step Guide]
    STEP --> NEXT[Next Step]
    NEXT --> |More Steps| STEP
    NEXT --> |Done| CLOSE3[Close Modal]
    
    ROUTER --> |other| OTHER[Detail View]
    
    CLOSE1 --> HOME
    CLOSE2 --> HOME
    CLOSE3 --> HOME
    PASS --> HOME
    RETRY --> PUZZLE
    OTHER --> HOME
    
    HOME --> TIPS[Tips Card at Bottom]
```

## 4. Data Flow Architecture

```mermaid
flowchart LR
    subgraph User["👤 User Action"]
        CLICK[Click / Tap]
    end

    subgraph Component["📄 Vue Component"]
        EVENT[Event Handler]
        RENDER[Reactive Render]
    end

    subgraph Store["🏪 Pinia Store"]
        STATE[State]
        ACTION[Action]
        GETTER[Getter/Computed]
    end

    subgraph DB["💾 Dexie.js"]
        WRITE[Put/Update]
        READ[Get/Where]
        DELETE[Delete]
    end

    subgraph API["🌐 Browser API"]
        SHARE[Web Share]
        SOUND[Web Audio]
        TTS2[Web Speech]
    end

    CLICK --> EVENT
    EVENT --> ACTION
    ACTION --> WRITE
    WRITE --> STATE
    STATE --> GETTER
    GETTER --> RENDER
    RENDER --> |Display| CLICK

    ACTION --> |Share| SHARE
    ACTION --> |Sound| SOUND
    ACTION --> |Read Aloud| TTS2

    READ --> STATE
    DELETE --> STATE
```

## 5. Child Management Flow

```mermaid
flowchart TD
    PROFILE[ProfileTab] --> CM[Child Management Section]
    
    CM --> LIST[Children List]
    LIST --> |Each Child| CARD[Child Card]
    
    CARD --> EDIT[Edit Child]
    CARD --> DEL[Delete Child]
    
    EDIT --> FORM[Edit Form]
    FORM --> |Save| UPDATE[Update in Dexie]
    UPDATE --> RELOAD[Reload anakStore]
    
    DEL --> CONFIRM[Confirm Dialog]
    CONFIRM --> |Yes| CASCADE[Cascade Delete]
    CASCADE --> |Delete| CH_DEL[Challenges]
    CASCADE --> |Delete| CH_HIST[Challenge History]
    CASCADE --> |Delete| CL_DEL[Checklists]
    CASCADE --> |Delete| SC_DEL[Schedules]
    CASCADE --> |Delete| AN_DEL[Anak Record]
    
    CONFIRM --> |No| LIST
    
    CM --> ADD[+ Tambah Anak Button]
    ADD --> ADD_FORM[Add Form]
    ADD_FORM --> |Name| NAME[Input Nama]
    ADD_FORM --> |Gender| GENDER[Select Gender]
    ADD_FORM --> |Birth Date| BIRTH[Tanggal/Bulan/Tahun]
    ADD_FORM --> |Save| CREATE[Create in Dexie]
    CREATE --> SEED[Seed Default Subpilars]
    SEED --> RELOAD
```

## 6. Challenge & Points Flow

```mermaid
flowchart TD
    TOOLS[ToolsTab] --> SELECT[AnakSelector]
    SELECT --> CHALL[ChallengePage]
    
    CHALL --> TABS{Active Tab}
    
    TABS --> |Active| ACTIVE[Active Challenges]
    TABS --> |History| HIST[Challenge History]
    
    ACTIVE --> CARD[Challenge Card]
    CARD --> CEL[🏦 Celengan Progress]
    
    CARD --> |+ Point| ADD[Increment Points]
    ADD --> SOUND1[🔊 Play Add Sound]
    ADD --> CHECK1{Points = Max?}
    CHECK1 --> |Yes| COMPLETE[Move to History]
    CHECK1 --> |No| UPDATE1[Update in Dexie]
    
    CARD --> |- Point| REM[Decrement Points]
    REM --> SOUND2[🔊 Play Remove Sound]
    REM --> UPDATE2[Update in Dexie]
    
    CARD --> |Edit| EDIT[Edit Form Modal]
    EDIT --> UPDATE3[Update in Dexie]
    
    CARD --> |Share| SHARE[Generate ShareCard]
    SHARE --> CANVAS[html2canvas → PNG]
    CANVAS --> WSA{Web Share Available?}
    WSA --> |Yes| NATIVE[Native Share Sheet]
    WSA --> |No| DOWNLOAD[Download PNG]
    
    ACTIVE --> ADD_BTN[+ Tambah Button]
    ADD_BTN --> ADD_FORM[Add Challenge Form]
    ADD_FORM --> |Category| CAT[Kitab Suci / Matematika / Bahasa / IPA]
    ADD_FORM --> |Title| TITLE[Input Title]
    ADD_FORM --> |Max Points| MAX[Input Max Points]
    ADD_FORM --> |Save| CREATE[Create in Dexie]
    
    COMPLETE --> HIST_CARD[History Card]
    HIST_CARD --> |Delete| DEL_HIST[Remove from History]
```

## 7. Evaluation & Progress Flow

```mermaid
flowchart TD
    PROG[ProgressTab] --> CHILD[Child Accordion Card]
    
    CHILD --> ACTIVE_SKILLS[Active Subpilars]
    CHILD --> COMPLETED_SKILLS[Completed Subpilars]
    
    ACTIVE_SKILLS --> BAR[Progress Bar %]
    ACTIVE_SKILLS --> EVAL_BTN[Evaluate Button]
    
    EVAL_BTN --> MODAL[AppModal - Evaluation]
    MODAL --> Q[5 Yes/No Questions]
    Q --> |From evaluasi.js| QUESTIONS[Question List]
    
    QUESTIONS --> Q1[Question 1: ✅ / ❌]
    QUESTIONS --> Q2[Question 2: ✅ / ❌]
    QUESTIONS --> Q3[Question 3: ✅ / ❌]
    QUESTIONS --> Q4[Question 4: ✅ / ❌]
    QUESTIONS --> Q5[Question 5: ✅ / ❌]
    
    Q1 --> CALC[Calculate Score]
    Q2 --> CALC
    Q3 --> CALC
    Q4 --> CALC
    Q5 --> CALC
    
    CALC --> RESULT{Score}
    RESULT --> |5/5| PERFECT[Perfect Score]
    RESULT --> |3-4| GOOD[Good Progress]
    RESULT --> |0-2| NEEDS_WORK[Needs More Practice]
    
    PERFECT --> ADD_40[+40% Progress]
    GOOD --> ADD_25[+25% Progress]
    NEEDS_WORK --> ADD_10[+10% Progress]
    
    ADD_40 --> UPDATE_PROG[Update Progress]
    ADD_25 --> UPDATE_PROG
    ADD_10 --> UPDATE_PROG
    
    UPDATE_PROG --> CHECK{Progress ≥ 100%?}
    CHECK --> |Yes| COMPLETE[Move to Completed]
    CHECK --> |No| SAVE[Save to Dexie]
    
    COMPLETE --> LOG[Add to History]
    LOG --> SAVE
    
    COMPLETED_SKILLS --> |Delete| RESET[Reset to Active]
    COMPLETED_SKILLS --> |Share| SHARE[Generate ShareCard]
```

## 8. Responsive Layout Flow

```mermaid
flowchart TD
    SCREEN{Screen Width?}
    
    SCREEN --> |< 1024px| MOBILE[Mobile Layout]
    SCREEN --> |≥ 1024px| DESKTOP[Desktop Layout]
    
    subgraph Mobile["Mobile Layout"]
        MH[AppHeader - Top Bar]
        MH --> HAMBURGER[☰ Hamburger Menu]
        HAMBURGER --> DRAWER[Drawer Sidebar]
        DRAWER --> DRAWER_LINKS[Challenge / Jadwal / Checklist]
        
        MAIN_M[Main Content Area]
        
        MB[BottomNav - 4 Tabs]
        MB --> HOME_T[🏠 Home]
        MB --> PROG_T[📊 Progress]
        MB --> TOOLS_T[🔧 Tools]
        MB --> PROF_T[👤 Profile]
    end
    
    subgraph Desktop["Desktop Layout"]
        DS[AppSidebar - 280px Fixed]
        DS --> USER_INFO[User Profile]
        DS --> NAV_LINKS[All Tab Links]
        DS --> TIP[Daily Tip]
        DS --> NOTIF[Notifications]
        
        MAIN_D[Main Content Area]
    end
    
    MOBILE --> Mobile
    DESKTOP --> Desktop
```

## 9. Share Feature Flow

```mermaid
flowchart TD
    TRIGGER{Share Trigger}
    
    TRIGGER --> |Challenge| CH_SHARE[Share Challenge]
    TRIGGER --> |Progress| PR_SHARE[Share Progress]
    TRIGGER --> |Checklist| CL_SHARE[Share Checklist]
    
    CH_SHARE --> CREATE_CARD[Create ShareCard Component]
    PR_SHARE --> CREATE_CARD
    CL_SHARE --> CREATE_CL[Create ShareChecklistCard]
    
    CREATE_CARD --> OFFSCREEN[Render Offscreen]
    CREATE_CL --> OFFSCREEN
    
    OFFSCREEN --> HTML2CAN[html2canvas-pro → Canvas]
    HTML2CAN --> BLOB[Canvas → Blob → File]
    
    BLOB --> CHECK{Web Share API?}
    
    CHECK --> |Supported| SHARE_API[Navigator.share]
    SHARE_API --> NATIVE_SHARE[System Share Sheet]
    NATIVE_SHARE --> APPS[WhatsApp / Telegram / etc.]
    
    CHECK --> |Not Supported| FALLBACK[Download PNG]
    FALLBACK --> SAVE[Save to Device]
    
    subgraph Referral["Referral Code"]
        GEN[Generate 6-char Code]
        GEN --> URL[halobunda.app/?ref=CODE]
        URL --> CLIP[Copy to Clipboard]
    end
```

## 10. PWA Install Flow

```mermaid
stateDiagram-v2
    [*] --> FirstVisit

    FirstVisit --> InstallPrompt : beforeinstallprompt event
    FirstVisit --> NoPrompt : Event not fired

    state InstallPrompt {
        [*] --> ShowBanner
        ShowBanner --> UserChoice

        state UserChoice {
            Install --> Accept : Click Install
            Install --> Dismiss : Click Dismiss/X
        }

        Accept --> Installed : appinstalled event
        Dismark --> Hidden : Hide banner
    }

    Installed --> [*] : App installed
    NoPrompt --> [*] : Continue in browser
    Hidden --> [*] : Continue in browser
```

## 11. Database Schema (ER Diagram)

```mermaid
erDiagram
    ANAK {
        int id PK
        string nama
        string gender
        string emoji
        string bg
        int tanggal
        int bulan
        int tahun
        json skills
        json completedSkills
        json history
    }

    CHALLENGES {
        int id PK
        int anakId FK
        string category
        string title
        string notes
        string emoji
        string bg
        string color
        int points
        int maxPoints
    }

    CHALLENGE_HISTORY {
        int id PK
        int anakId FK
        string category
        string title
        string emoji
        string bg
        int maxPoints
    }

    CHECKLISTS {
        int id PK
        int anakId FK
        string title
        json items
    }

    SCHEDULES {
        int id PK
        int anakId FK
        string time
        string label
        boolean done
    }

    SETTINGS {
        string key PK
        any value
    }

    ANAK ||--o{ CHALLENGES : "has"
    ANAK ||--o{ CHALLENGE_HISTORY : "has"
    ANAK ||--o{ CHECKLISTS : "has"
    ANAK ||--o{ SCHEDULES : "has"
```

## 12. Component Dependency Graph

```mermaid
graph TD
    APP[App.vue] --> PT[PilarTab]
    APP --> PG[ProgressTab]
    APP --> TT[ToolsTab]
    APP --> PF[ProfileTab]
    APP --> POT[PoinTab]
    APP --> RP[ReferralPage]
    APP --> AH[AppHeader]
    APP --> AS[AppSidebar]
    APP --> BN[BottomNav]

    PT --> AP[AktivitasPage]
    AP --> AD[AktivitasDetailPage]
    AD --> SR[StoryReader]
    AD --> RR[RoleplayReader]
    AD --> PR[PuzzleReader]
    AD --> PJR[ProjectReader]

    PG --> AM[AppModal]
    PG --> AB[AppButton]
    PG --> SC[ShareCard]

    TT --> ANS[AnakSelector]
    TT --> CP[ChallengePage]
    TT --> JP[JadwalPage]
    TT --> CLP[ChecklistPage]

    CP --> AM
    CP --> AI[AppInput]
    CP --> AS2[AppSelect]
    CP --> AT[AppTextarea]
    CP --> AB
    CP --> SC

    JP --> AM
    JP --> AI
    JP --> AB

    CLP --> AM
    CLP --> AI
    CLP --> AC[AppCheckbox]
    CLP --> AB
    CLP --> SCC[ShareChecklistCard]

    PF --> AI
    PF --> AS2
    PF --> AB
    PF --> AM

    SR --> |TTS| API1[Web Speech API]
    RR --> |TTS| API1
    CP --> |Sound| API2[Web Audio API]
    SC --> |Share| API3[Web Share API]
```

---

*Generated: 2026-06-07 | Halo Bunda v1.0.0*
