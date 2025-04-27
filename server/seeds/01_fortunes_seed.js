/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async (knex) => {
  await knex('fortunes').del();
  await knex('fortunes').insert([
    { text: 'You will write clean code today.' },
    { text: 'A surprise meeting will inspire you.' },
    { text: 'Your day will be punctuated by small joys.' },
    { text: 'Someone from your past will reach out.' },
    { text: 'An unexpected bug will lead to a breakthrough.' },
    { text: 'You will discover a shortcut that saves time.' },
    { text: 'A quiet moment will spark a big idea.' },
    { text: 'Your persistence will pay off soon.' },
    { text: 'Collaboration will bring clarity.' },
    { text: 'Keep an open mind; opportunity strikes.' },
    { text: 'Your energy attracts positive people.' },
    { text: 'A small tweak will solve a major issue.' },
    { text: 'Patience brings better solutions.' },
    { text: 'A forgotten task resurfaces to help you.' },
    { text: 'Trust your instincts on the next step.' },
    { text: 'Clear communication avoids confusion.' },
    { text: 'Your code will compile on the first try.' },
    { text: 'Someone will praise your work today.' },
    { text: 'A random coffee break leads to a new friend.' },
    { text: 'Every challenge is a chance to learn.' }
  ]);
};
