CREATE MIGRATION m1qe25mzx7i7d6ghbvbfctwgpp2caltnd7k4eqxonmwkoonpl5pbsa
    ONTO m1gryxpvjwa3kiu7b7c6wrhd4donwqauqbiashrayavm4icbzop6ha
{
  ALTER TYPE default::Schedule {
      ALTER PROPERTY date {
          SET TYPE std::str USING (<std::str>.date);
      };
      ALTER PROPERTY time {
          SET TYPE std::str USING (<std::str>.time);
      };
  };
};
