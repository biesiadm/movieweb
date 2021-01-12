import express from 'express';
import MoviesRouter from './services/movies';

const app = express();
app.use('/movies', MoviesRouter);

app.listen(8080, () => {
    console.log(`api-gateway started on port 8080!`);
});
