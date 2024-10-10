CREATE MIGRATION m1nszk74g43x3z5fmxuxlzf4dmedkpwbt6u5iul25gyedpgqp7vtrq
    ONTO m1qe25mzx7i7d6ghbvbfctwgpp2caltnd7k4eqxonmwkoonpl5pbsa
{
  ALTER TYPE default::Schedule {
      DROP LINK beneficiary;
  };
  ALTER TYPE default::Schedule {
      CREATE PROPERTY beneficiary_id: std::str;
  };
};
