const axios = require('axios')

const labels = [
    { id: "to-watch", name: "Para Assistir" },
    { id: "watching", name: "Assistindo" },
    { id: "watched", name: "Assistido" }
]

const apiKey = "54bc8a90b9ec3f31addef0c092d7c22e";
const getSerieImage = async (name) => {
    try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${name}&page=1&include_adult=false`;
        const res = await axios.get(url);
        return {
            poster: `//image.tmdb.org/t/p/w300${res.data.results[0].poster_path}`,
            background: `//image.tmdb.org/t/p/original${res.data.results[0].backdrop_path}`,
        };
    } catch (err) { }
    return { poster: "", background: "" };
};

const pagination = async (model, conditions, params) => {
    const total = await model.count(conditions)
    const pageSize = parseInt(params.pageSize) || 20
    const currentPage = parseInt(params.page) || 0

    const pagination = {
        currentPage,
        pageSize,
        pages: parseInt(total / pageSize)
    }

    const results = await model
        .find(conditions)
        .skip(currentPage * pageSize)
        .limit(pageSize)

    return {
        data: results,
        pagination
    }
}

const about = (req, res) => {
    res.render('sobre')
}

const index = async ({ Serie }, req, res) => {
    const results = await pagination(Serie, {}, req.query)
    res.render('index', { results, labels })
}

const novaProcess = async ({ Serie }, req, res) => {
    const newSerie = req.body
    const { poster, background } = await getSerieImage(req.body.name)
    newSerie['poster'] = poster
    newSerie['background'] = background

    const serie = new Serie(req.body)
    try {
        await serie.save()
        res.redirect('/')
    } catch (e) {
        res.render('nova', {
            errors: Object.keys(e.errors)
        })
    }
}

const novaForm = (req, res) => {
    res.render('nova', { errors: [] })
}

const excluir = async ({ Serie }, req, res) => {
    await Serie.remove({ _id: req.params.id })
    res.redirect('/')
}

const editarProcess = async ({ Serie }, req, res) => {
    const serie = await Serie.findOne({ _id: req.params.id })
    serie.name = req.body.name
    serie.status = req.body.status
    try {
        await serie.save()
        res.redirect('/')
    } catch (e) {
        res.render('editar', { serie, labels, errors: Object.keys(e.errors) })
    }

}

const editarForm = async ({ Serie }, req, res) => {
    const serie = await Serie.findOne({ _id: req.params.id })
    res.render('editar', { serie, labels, errors: [] })
}

const info = async ({ Serie }, req, res) => {
    const serie = await Serie.findOne({ _id: req.params.id })
    res.render('info', { serie })
}

const addComentario = async ({ Serie }, req, res) => {
    await Serie.updateOne({ _id: req.params.id }, { $push: { comments: req.body.comentario } })
    res.redirect('/info/' + req.params.id)
}

module.exports = {
    about,
    index,
    novaProcess,
    novaForm,
    excluir,
    editarForm,
    editarProcess,
    info,
    addComentario
}