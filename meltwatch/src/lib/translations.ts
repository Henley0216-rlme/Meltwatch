export type Language = "en" | "zh";

export const translations = {
  en: {
    nav: {
      products: "Products",
      solutions: "Solutions",
      resources: "Resources",
      pricing: "Pricing",
      signIn: "Sign in",
      getDemo: "Get a demo",
    },

    hero: {
      eyebrow: "Context-aware consumer intelligence",
      subtitle:
        "Meltwatch reads the world through the lens of your company — your products, your tone, your competitors, your audience. The signal you actually need, not the noise you don't.",
      cta: "Explore the platform",
      caption: "No credit card. Tailored onboarding within 7 days.",
    },

    logos: {
      title: "Trusted by teams that move on the truth",
    },

    stats: {
      title: "Built on a serious data foundation",
      items: [
        { value: "1.4T+", label: "historical posts indexed" },
        { value: "100M+", label: "online sources monitored" },
        { value: "<60s", label: "real-time alert latency" },
        { value: "150+", label: "countries covered" },
      ],
    },

    capabilities: {
      eyebrow: "Four capabilities, one intelligent suite",
      title: "Everything your brand needs to see, faster.",
      crisis: {
        tag: "Crisis Management",
        body:
          "Real-time alerts surface anomalies the moment they emerge on social — long before the news cycle picks them up.",
      },
      competitive: {
        tag: "Strategic Analysis",
        body:
          "Translate market signals and competitive dynamics into strategic frameworks that help leadership teams prioritize initiatives and anticipate market shifts.",
      },
      consumer: {
        tag: "Consumer Insights",
        body:
          "Mine 15 months of conversation history to understand emerging needs, unmet demand, and the language consumers actually use.",
      },
      influencer: {
        tag: "Influencer Marketing",
        body:
          "Identify authentic voices in your industry — and automatically weed out accounts with fraudulent or inflated followings.",
      },
    },

    services: {
      crisis: {
        headline: "Crisis Management. All-in-one social media management.",
        body:
          "Most crises aren't born in the news — they smolder on social for hours, sometimes days, before mainstream media catches on. Meltwatch's anomaly detection watches your specific topics, products, executives, and regions, learns your normal baseline, and pages you the moment something breaks pattern.",
        bullets: [
          "Sub-60-second alerting on volume, sentiment, and velocity spikes",
          "Custom escalation rules per stakeholder, channel, and geography",
          "Auto-generated brief: what's happening, where, who's amplifying, and the suggested first response",
          "Replay timeline so legal and comms see exactly how the conversation evolved",
        ],
      },
      competitive: {
        headline: "Business Strategy. Intelligence-driven decisions.",
        body:
          "Understanding where your business stands today is only the first step. Meltwatch translates market signals, competitive dynamics, and consumer sentiment into strategic frameworks that help leadership teams allocate resources, prioritize initiatives, and anticipate market shifts before they happen.",
        bullets: [
          "Market opportunity mapping: identify white spaces your competitors haven't claimed",
          "Strategic narrative alignment: ensure your messaging matches the conversations that matter",
          "Scenario modeling based on real-time signal changes across channels and regions",
          "Executive briefings that translate data into actionable strategic priorities",
        ],
      },
      consumer: {
        headline: "Social Listening. Pioneering consumer intelligence.",
        body:
          "Treat the open social web as the largest focus group ever assembled. Ask Meltwatch a research question — about an emerging need, an unmet pain point, a category shift — and get back a synthesised answer drawn from 15 months of conversation, segmented by audience, geography, and lifestage.",
        bullets: [
          "Natural-language research queries — no Boolean required",
          "Audience segmentation by demographic, psychographic, and behavioural signals",
          "Trend detection that distinguishes sustained shifts from short-lived spikes",
          "Verbatim libraries: hear consumers in their own words, not paraphrased",
        ],
      },
      influencer: {
        headline: "Influencer Marketing. End-to-end.",
        body:
          "The influencer market is full of inflated follower counts, engagement pods, and outright fraud. Meltwatch verifies authenticity at the account level — flagging suspicious follower curves, bot-like engagement patterns, and audience overlap with known fraud rings — so the creators you brief are the ones your customers actually listen to.",
        bullets: [
          "Authenticity score for every creator, refreshed daily",
          "Bot-cluster detection on follower bases and engagement patterns",
          "Audience-quality breakdown: real fans, passive followers, suspicious accounts",
          "End-to-end campaign workflow: discovery → CRM → contracts → payments → measurement",
        ],
      },
    },

    differentiator: {
      eyebrow: "Why Meltwatch",
      title: "Every model, tuned to your company.",
      body:
        "Generic NLP treats your brand like any other string in a database. Meltwatch ingests your corporate context — products, executives, partners, history, tone, taxonomy — at onboarding, and conditions every classifier, sentiment model, and alerting rule on it. The same word means different things in pharma, finance, and gaming. We get that right.",
      pillars: [
        {
          title: "Your taxonomy",
          desc: "Products, sub-brands, regions, and competitor sets defined once and applied everywhere.",
        },
        {
          title: "Your tone",
          desc: "Sentiment models calibrated to how customers talk about your category — not generic positive/negative.",
        },
        {
          title: "Your stakeholders",
          desc: "Alerts, dashboards, and briefings shaped by role: comms, marketing, product, exec.",
        },
        {
          title: "Your data",
          desc: "Bring your CRM, support, and survey data; we blend it with the social signal.",
        },
      ],
    },

    cta: {
      title: "See what Meltwatch sees about your brand.",
      body:
        "Book a 30-minute walkthrough. We'll preload your brand, your competitors, and your last twelve months — then show you what we found.",
      button: "Request a demo",
      note: "Custom-tuned onboarding · 12-month annual plans · Enterprise SSO",
    },

    footer: {
      tagline: "Intelligence shaped to your business.",
      products: "Products",
      productItems: [
        "Crisis Management",
        "Consumer Insights",
        "Strategic Advisory",
        "Influencer Marketing",
      ],
      company: "Company",
      companyItems: ["About", "Customers", "Careers", "Press", "Contact"],
      resources: "Resources",
      resourceItems: ["Blog", "Reports", "Webinars", "Help Center", "API docs"],
      legal: "Legal",
      legalItems: ["Privacy", "Terms", "Security", "DPA", "Cookie policy"],
      copyright: "© 2026 Meltwatch. Built for teams that move on the truth.",
      status: "All systems operational",
    },
  },

  zh: {
    nav: {
      products: "产品",
      solutions: "解决方案",
      resources: "资源",
      pricing: "定价",
      signIn: "登录",
      getDemo: "预约演示",
    },

    hero: {
      eyebrow: "贴合企业语境的消费者情报",
      subtitle:
        "Meltwatch 通过你公司独有的视角解读世界——你的产品、你的语调、你的竞争对手、你的受众。只留下你真正需要的信号,过滤掉无关的噪声。",
      cta: "申请演示",
      caption: "无需信用卡。7 天内完成定制化上线。",
    },

    logos: {
      title: "受到追求真相的团队信赖",
    },

    stats: {
      title: "建立在严谨的数据基础之上",
      items: [
        { value: "1.4 万亿+", label: "历史帖子索引" },
        { value: "1 亿+", label: "在线信息源监测" },
        { value: "<60 秒", label: "实时告警延迟" },
        { value: "150+", label: "覆盖国家与地区" },
      ],
    },

    capabilities: {
      eyebrow: "四大核心能力,一套智能工具",
      title: "品牌需要看到的,你都能更早看到。",
      crisis: {
        tag: "危机管理",
        body:
          "实时告警在异常出现的瞬间就会浮现——远早于新闻周期捕捉到它。",
      },
      competitive: {
        tag: "商业战略分析",
        body:
          "将市场信号与竞争动态转化为战略框架，帮助领导层确定优先项并提前预判市场变化。",
      },
      consumer: {
        tag: "消费者洞察",
        body:
          "深度挖掘 15 个月的对话历史,洞察新兴需求、未被满足的痛点、以及消费者真正使用的语言。",
      },
      influencer: {
        tag: "网红营销",
        body:
          "识别行业中的真正声音——并自动剔除粉丝注水或造假的账号。",
      },
    },

    services: {
      crisis: {
        headline: "危机管理。一站式社交媒体管理。",
        body:
          "大多数危机并非诞生于新闻——它们在社交平台上酝酿数小时甚至数天,主流媒体才会捕捉到。Meltwatch 的异常检测会监测你专属的话题、产品、高管与地区,学习你的常态基线,一旦突破阈值就立刻提醒你。",
        bullets: [
          "声量、情感、传播速度突变,60 秒内推送",
          "按角色、渠道、地域定制升级规则",
          "自动生成简报:发生了什么、在哪里、谁在传播、建议的首次回应",
          "对话演变时间线回放,法务与公关一目了然",
        ],
      },
      competitive: {
        headline: "商业战略分析。数据驱动的战略决策。",
        body:
          "了解企业当下所处的市场位置，只是第一步。Meltwatch 将市场信号、竞争动态与消费者情绪转化为战略框架，帮助领导层合理分配资源、确定优先项，并在市场变化发生前预判趋势。",
        bullets: [
          "市场机会图谱：识别竞争对手尚未占据的白地",
          "战略叙事校准：确保你的信息传递契合真正重要的对话",
          "基于跨渠道、跨地域实时信号变化的情景建模",
          "将数据转化为可执行战略优先项的高管简报",
        ],
      },
      consumer: {
        headline: "社交聆听。领先的消费者情报。",
        body:
          "把公开社交网络当作历史上最大的焦点小组。向 Meltwatch 提一个研究问题——新兴需求、未被满足的痛点、品类变迁——它会基于 15 个月的对话给出综合答案,并按受众、地理、人生阶段细分。",
        bullets: [
          "自然语言提问——无需布尔逻辑",
          "按人口、心理与行为信号进行受众细分",
          "趋势检测,区分长期变迁与短暂的尖峰",
          "原话语料库:听消费者用自己的语言表达",
        ],
      },
      influencer: {
        headline: "网红营销。全流程。",
        body:
          "网红市场充斥着虚假粉丝、刷量小组与彻头彻尾的造假。Meltwatch 在账号层面验证真实性——标记可疑的粉丝增长曲线、机器人式互动模式、以及与已知诈骗团伙的受众重叠——确保你最终对接的是消费者真正在意的创作者。",
        bullets: [
          "每位创作者每日刷新的真实性评分",
          "粉丝群与互动模式的机器人聚类检测",
          "受众质量分层:真粉丝、被动粉丝、可疑账号",
          "端到端工作流:发现 → CRM → 合同 → 付款 → 效果度量",
        ],
      },
    },

    differentiator: {
      eyebrow: "为什么选择 Meltwatch",
      title: "每一个模型,都为你的公司而调校。",
      body:
        "通用的 NLP 把你的品牌当作数据库里的任意字符串。Meltwatch 在上线时就接入你的企业语境——产品、高管、合作方、历史、语调、分类法——并基于此训练每一个分类器、情感模型与告警规则。同一个词在医药、金融、游戏中含义截然不同。我们能识别出来。",
      pillars: [
        {
          title: "你的分类法",
          desc: "产品、子品牌、地区与竞品集合,定义一次,处处生效。",
        },
        {
          title: "你的语调",
          desc: "情感模型按你品类的真实表达方式校准——不是泛泛的正负面。",
        },
        {
          title: "你的相关方",
          desc: "告警、仪表盘、简报按角色塑形:公关、市场、产品、高管。",
        },
        {
          title: "你的数据",
          desc: "可对接 CRM、客服、调研数据,与社交信号融合分析。",
        },
      ],
    },

    cta: {
      title: "看看 Meltwatch 眼中的你的品牌。",
      body:
        "预约 30 分钟演示。我们会先加载你的品牌、竞品和过去十二个月的数据——然后把我们发现的内容呈现给你。",
      button: "申请演示",
      note: "定制化上线 · 12 个月年度计划 · 企业 SSO",
    },

    footer: {
      tagline: "为你的业务量身定制的智能洞察。",
      products: "产品",
      productItems: ["危机管理", "消费者洞察", "策略建议", "网红营销"],
      company: "公司",
      companyItems: ["关于", "客户", "招聘", "新闻", "联系"],
      resources: "资源",
      resourceItems: ["博客", "报告", "网络研讨会", "帮助中心", "API 文档"],
      legal: "法律",
      legalItems: ["隐私", "条款", "安全", "数据处理协议", "Cookie 政策"],
      copyright: "© 2026 Meltwatch. 为追求真相的团队而生。",
      status: "所有系统运行正常",
    },
  },
} as const;

export type TranslationDict = typeof translations.en;
