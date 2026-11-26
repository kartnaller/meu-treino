// Programa importado da Central do Aluno (Ultra Academia, unidade Laranjeiras) em 25/11/2026.
// Músculos: p = principais, s = secundários. Chaves em MUSCLES (app.js).
window.PROGRAMA_INICIAL = {
  id: "ultra-emagrecimento-f1-2026-11",
  name: "Emagrecimento – Fase 1",
  coach: "Prof. João Lourenço",
  source: "Central do Aluno – Ultra Laranjeiras",
  createdAt: "2026-11-25T00:00:00-03:00",
  workouts: [
    {
      id: "A", name: "Treino A", subtitle: "Peito, costas, ombros e braços",
      exercises: [
        { name: "Supino máquina", sets: 4, reps: 12, rest: "45–60 s", video: "EStaRchnbiM",
          p: ["peitoral"], s: ["deltoide_ant", "triceps"],
          tips: [
            "Ajuste o banco para os pegadores ficarem na altura do meio do peito.",
            "Escápulas encaixadas para trás e para baixo; ombros longe das orelhas.",
            "Cotovelos a uns 45–60° do tronco, não abertos a 90°.",
            "Não trave os cotovelos no fim e volte controlando (2–3 s)."
          ] },
        { name: "Crucifixo máquina (pegada neutra)", sets: 4, reps: 12, rest: "45–60 s", video: "qZVNY78Ij8M",
          p: ["peitoral"], s: ["deltoide_ant"],
          alt: { name: "Crucifixo com halteres", video: "6zSm5KfuflE" },
          tips: [
            "Banco ajustado para os braços ficarem na altura dos ombros ou um pouco abaixo.",
            "Cotovelos levemente dobrados e fixos o tempo todo.",
            "Na volta, pare no alongamento do peito; não deixe os braços passarem muito da linha do corpo.",
            "Costas e cabeça apoiadas no encosto."
          ] },
        { name: "Puxada máquina (pegada pronada)", sets: 4, reps: 12, rest: "45–60 s", video: "DHrxpIuopGM",
          p: ["dorsal"], s: ["biceps", "romboides", "deltoide_post"],
          tips: [
            "Ajuste o apoio das coxas para não sair do banco.",
            "Leve os cotovelos para baixo e para trás, até a pegada chegar perto do alto do peito.",
            "Sem jogar o tronco para trás para ganhar impulso.",
            "Suba devagar até estender os braços, sem soltar o peso."
          ] },
        { name: "Desenvolvimento máquina (pegada neutra)", sets: 4, reps: 12, rest: "45–60 s", video: "7Ir02U0fEnI",
          p: ["deltoide_ant", "deltoide_lat"], s: ["triceps", "trapezio"],
          tips: [
            "Banco ajustado para os pegadores começarem na altura dos ombros.",
            "Costas apoiadas; evite arquear a lombar para empurrar.",
            "Empurre sem travar os cotovelos no topo.",
            "Se o ombro incomodar, reduza a amplitude na descida."
          ] },
        { name: "Crucifixo com halteres", sets: 4, reps: 12, rest: "45–60 s", video: "6zSm5KfuflE",
          p: ["peitoral"], s: ["deltoide_ant"],
          alt: { name: "Cross-over", video: "ABr1Hf_PTM8" },
          tips: [
            "Cotovelos levemente dobrados e fixos: o movimento é no ombro, não no cotovelo.",
            "Desça até sentir o peito alongar, sem passar muito da linha do tronco.",
            "Carga moderada: na posição aberta o ombro fica mais exposto.",
            "Pés firmes no chão e escápulas apoiadas no banco."
          ] },
        { name: "Remada máquina (pegada neutra)", sets: 4, reps: 12, rest: "45–60 s", video: "m9Yvr0X3NOk",
          p: ["dorsal", "romboides"], s: ["deltoide_post", "biceps"],
          tips: [
            "Peito apoiado no suporte e tronco firme.",
            "Comece puxando as escápulas para trás, depois os cotovelos.",
            "Cotovelos perto do corpo.",
            "Não encolha os ombros em direção às orelhas."
          ] },
        { name: "Rosca máquina", sets: 4, reps: 12, rest: "45–60 s", video: "4cK7nL2cwYg",
          p: ["biceps"], s: ["antebraco"],
          tips: [
            "Braço bem apoiado e cotovelo alinhado com o eixo da máquina.",
            "Não tire o braço do apoio nem use o tronco.",
            "Desça controlando até quase estender, sem soltar o peso no fim.",
            "Punhos retos."
          ] },
        { name: "Tríceps pulley", sets: 4, reps: 12, rest: "45–60 s", video: "JJmCFid77m4",
          p: ["triceps"], s: [],
          tips: [
            "Cotovelos colados ao lado do corpo: só o antebraço se move.",
            "Estenda por completo sem jogar os ombros para a frente.",
            "Tronco levemente inclinado e abdômen firme.",
            "Volte até uns 90° de cotovelo, controlando."
          ] },
        { name: "Extensão de coluna máquina", sets: 4, reps: 12, rest: "45–60 s", video: "",
          p: ["lombar"], s: ["gluteo", "posteriores"],
          alt: { name: "Extensão de coluna no solo", video: "EWSCLvK-69I" },
          tips: [
            "Movimento lento e controlado, sem tranco.",
            "Volte só até a coluna ficar alinhada; não hiperestenda.",
            "Comece com carga leve: o objetivo é resistência da lombar.",
            "Dor na lombar (diferente de cansaço) é sinal para parar."
          ] },
        { name: "Trote moderado", type: "cardio", sets: 1, reps: 15, unit: "min", rest: "", video: "MjSkOEQZaEk",
          p: ["quadriceps", "posteriores", "panturrilha"], s: ["gluteo"],
          tips: [
            "Moderado: dá para falar frases curtas, mas não cantar.",
            "Use os 2–3 primeiros minutos mais leves para aquecer.",
            "Na esteira, evite segurar nas barras laterais.",
            "Se usar inclinação, reduza a velocidade."
          ] }
      ]
    },
    {
      id: "B", name: "Treino B", subtitle: "Pernas, glúteos e abdômen",
      exercises: [
        { name: "Leg press", sets: 4, reps: 12, rest: "45–60 s", video: "ufBJZTUYrLw",
          p: ["quadriceps", "gluteo"], s: ["posteriores", "adutores"],
          alt: { name: "Leg press máquina articulada", video: "" },
          tips: [
            "Pés na largura do quadril, no meio da plataforma.",
            "Joelhos seguem a direção dos pés; não deixe entrarem para dentro.",
            "Desça só até onde quadril e lombar continuam colados no encosto.",
            "Não trave os joelhos no topo e use as travas de segurança."
          ] },
        { name: "Cadeira abdutora", sets: 4, reps: 12, rest: "45–60 s", video: "brE0u7cOh3s",
          p: ["gluteo_medio"], s: ["gluteo"],
          tips: [
            "Costas apoiadas e quadril bem encostado no banco.",
            "Abra com controle e volte devagar, sem deixar as placas baterem.",
            "Use uma amplitude confortável para o quadril."
          ] },
        { name: "Cadeira adutora", sets: 4, reps: 12, rest: "45–60 s", video: "sKnqsYNox-w",
          p: ["adutores"], s: [],
          tips: [
            "Ajuste a abertura inicial a uma amplitude confortável, sem puxão na virilha.",
            "Feche com controle e volte devagar.",
            "Costas apoiadas e quadril no banco."
          ] },
        { name: "Mesa flexora", sets: 4, reps: 12, rest: "45–60 s", video: "1HRJwS2wFKg",
          p: ["posteriores"], s: ["panturrilha"],
          alt: { name: "Mobilidade articular", video: "" },
          tips: [
            "Joelho alinhado com o eixo da máquina; rolo logo acima do tornozelo.",
            "Quadril colado no banco: se ele subir, a carga está alta.",
            "Flexione até perto do glúteo e desça controlando, sem tranco."
          ] },
        { name: "Cadeira extensora", sets: 4, reps: 15, rest: "45–60 s", video: "BiTsRy8uq7g",
          p: ["quadriceps"], s: [],
          tips: [
            "Joelho alinhado com o eixo da máquina; rolo na parte baixa da canela.",
            "Costas apoiadas e mãos nos pegadores laterais.",
            "Estenda sem tranco, segure 1 s no alto e desça devagar."
          ] },
        { name: "Abdominal máquina", sets: 4, reps: 15, rest: "45–60 s", video: "i5BGyEe7ZNQ",
          p: ["abdomen"], s: ["obliquos"],
          tips: [
            "O movimento é enrolar o tronco (costelas em direção à pelve), não puxar com os braços.",
            "Solte o ar ao contrair.",
            "Volte devagar, sem deixar o peso bater.",
            "Pescoço relaxado, sem puxar a cabeça."
          ] },
        { name: "Panturrilha no step (gêmeos)", sets: 4, reps: 15, rest: "45–60 s", video: "S22vqH3ql38",
          p: ["panturrilha"], s: [],
          alt: { name: "Gêmeos máquina em pé", video: "v7DgkaBj_so" },
          tips: [
            "Só a ponta dos pés na borda do step; segure em algo para equilíbrio.",
            "Desça o calcanhar abaixo do step e suba o máximo na ponta dos pés.",
            "Pausa de 1 s em cima e embaixo, sem quicar.",
            "Joelhos estendidos, mas não travados."
          ] },
        { name: "Trote moderado", type: "cardio", sets: 1, reps: 15, unit: "min", rest: "", video: "MjSkOEQZaEk",
          p: ["quadriceps", "posteriores", "panturrilha"], s: ["gluteo"],
          tips: [
            "Moderado: dá para falar frases curtas, mas não cantar.",
            "Use os 2–3 primeiros minutos mais leves para aquecer.",
            "Na esteira, evite segurar nas barras laterais.",
            "Se usar inclinação, reduza a velocidade."
          ] }
      ]
    }
  ]
};
