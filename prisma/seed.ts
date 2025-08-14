// prisma/seed.js

const { PrismaClient, Role, ServiceCategory } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando o processo de seed...");

    // 1. Limpar dados antigos na ordem correta
    await prisma.dentistService.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.dentistProfile.deleteMany({});
    await prisma.patientProfile.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.clinic.deleteMany({});
    console.log("Banco de dados limpo.");

    // 2. Criar a Clínica Única
    const clinic = await prisma.clinic.create({
      data: {
        name: "Clínica Odontológica Sorriso Digital",
        address: "Avenida Principal, 100, Centro, João Monlevade, MG",
        phones: "(31) 3852-1234",
        cnpj: "11.222.333/0001-44",
      },
    });
    console.log(`Clínica "${clinic.name}" criada.`);

    // 3. Criar o Catálogo Mestre de Serviços
    const services = await prisma.service.createManyAndReturn({
      data: [
        {
          name: "Consulta e Avaliação",
          description: "Diagnóstico completo e plano de tratamento.",
          price: 150,
          duration: 30,
          category: "DIAGNOSTICO_E_PREVENCAO",
          imageUrl:
            "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
        },
        {
          name: "Limpeza e Profilaxia",
          description: "Remoção de placa e tártaro.",
          price: 250,
          duration: 50,
          category: "DIAGNOSTICO_E_PREVENCAO",
          imageUrl:
            "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
        },
        {
          name: "Restauração em Resina",
          description: "Reparo de dentes com cáries.",
          price: 350,
          duration: 60,
          category: "RESTAURACAO_E_ENDODONTIA",
          imageUrl:
            "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
        },
        {
          name: "Clareamento a Laser",
          description: "Clareamento para dentes mais brancos.",
          price: 1200,
          duration: 90,
          category: "ESTETICA",
          imageUrl:
            "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
        },
        {
          name: "Tratamento de Canal",
          description: "Tratamento de canal radicular.",
          price: 950,
          duration: 120,
          category: "RESTAURACAO_E_ENDODONTIA",
          imageUrl:
            "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
        },
        {
          name: "Aparelho Ortodôntico",
          description: "Instalação de aparelho fixo.",
          price: 700,
          duration: 60,
          category: "ORTODONTIA",
          imageUrl:
            "https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png",
        },
        {
          name: "Implante Dentário",
          description: "Substituição de dentes perdidos.",
          price: 3000,
          duration: 180,
          category: "IMPLANTODONTIA",
          imageUrl:
            "https://utfs.io/f/f64f1bd4-59ce-4ee3-972d-2399937eeafc-16x.png",
        },
      ],
    });
    console.log(`${services.length} serviços mestres criados.`);

    // 4. Criar Profissionais (Dentistas)
    const dentists = [
      {
        user: {
          name: "Dr. Carlos Andrade",
          email: "carlos.andrade@email.com",
          role: Role.DENTISTA,
        },
        profile: {
          croNumber: "MG-12345",
          specialization: "Clínico Geral e Estética",
          bio: "Com 10 anos de experiência, Dr. Carlos é especialista em transformar sorrisos através de restaurações e clareamentos.",
          profileImageUrl:
            "https://utfs.io/f/6b0888f8-b69f-4be7-a13b-52d1c0c9cab2-17m.png",
        },
        services: [
          "Consulta e Avaliação",
          "Limpeza e Profilaxia",
          "Restauração em Resina",
          "Clareamento a Laser",
        ],
      },
      {
        user: {
          name: "Dra. Ana Beatriz Costa",
          email: "anacosta.odonto@email.com",
          role: Role.DENTISTA,
        },
        profile: {
          croNumber: "MG-54321",
          specialization: "Ortodontia",
          bio: "Dra. Ana é apaixonada por ortodontia e dedicada a criar alinhamentos perfeitos para sorrisos saudáveis e bonitos.",
          profileImageUrl:
            "https://utfs.io/f/ef45effa-415e-416d-8c4a-3221923cd10f-17n.png",
        },
        services: [
          "Consulta e Avaliação",
          "Limpeza e Profilaxia",
          "Aparelho Ortodôntico",
        ],
      },
      {
        user: {
          name: "Dr. Roberto Martins",
          email: "roberto.implant@email.com",
          role: Role.DENTISTA,
        },
        profile: {
          croNumber: "MG-67890",
          specialization: "Implantodontia e Cirurgia",
          bio: "Especialista em cirurgias avançadas e reabilitação oral com implantes, devolvendo a função e a estética.",
          profileImageUrl:
            "https://utfs.io/f/a55f0f39-31a0-4819-8796-538d68cc2a0f-17o.png",
        },
        services: [
          "Consulta e Avaliação",
          "Implante Dentário",
          "Tratamento de Canal",
        ],
      },
    ];

    for (const dentistData of dentists) {
      // Cria o User e o DentistProfile associado
      const createdUser = await prisma.user.create({
        data: {
          ...dentistData.user,
          dentistProfile: {
            create: dentistData.profile,
          },
        },
      });
      console.log(`Dentista criado: ${createdUser.name}`);

      // 5. Vincular os serviços ao dentista
      for (const serviceName of dentistData.services) {
        const service = services.find((s) => s.name === serviceName);
        if (service) {
          await prisma.dentistService.create({
            data: {
              dentistId: createdUser.id,
              serviceId: service.id,
            },
          });
        }
      }
      console.log(` -> Serviços atribuídos a ${createdUser.name}.`);
    }

    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro ao executar o seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
