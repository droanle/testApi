CREATE MIGRATION m1gryxpvjwa3kiu7b7c6wrhd4donwqauqbiashrayavm4icbzop6ha
    ONTO initial
{
  CREATE TYPE default::Beneficiary {
      CREATE REQUIRED PROPERTY cpf: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE TYPE default::Schedule {
      CREATE REQUIRED LINK beneficiary: default::Beneficiary;
      CREATE REQUIRED PROPERTY date: cal::local_date;
      CREATE REQUIRED PROPERTY time: cal::local_time;
  };
};
